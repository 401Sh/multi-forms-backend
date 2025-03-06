import { BadRequestException, ConflictException, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as argon2 from 'argon2';
import { RefreshSessionEntity } from './entities/refresh-session.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { addDays, addHours, addMinutes } from 'date-fns';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';
import { UserEntity } from 'src/users/entities/user.entity';

@Injectable()
export class AuthsService {
  private static readonly logger = new Logger(AuthsService.name);

  constructor(
    @InjectRepository(RefreshSessionEntity)
    private refreshSessionRepository: Repository<RefreshSessionEntity>,

    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}


  async signUp(createUserDto: CreateUserDto, ua: string, ip: string, fp: string) {
    // Create user
    const newUser = await this.usersService.create(
      { ...createUserDto }
    );

    // Create tokens
    const tokens = await this.getTokens(newUser.id, newUser.login);
    await this.createRefreshSession(
      newUser,
      tokens.refreshToken,
      ua,
      ip,
      fp
    );
    return tokens;
  };


  async signIn(authDto: AuthDto, ua: string, ip: string, fp: string) {
    // Check if user exists
    const user = await this.usersService.findByLogin(authDto.login);

    if (!user) throw new BadRequestException('User does not exist');

    // Verify password
    const verifiedPassword = await argon2.verify(user.password, authDto.password);
    if (!verifiedPassword){
      throw new BadRequestException('Password is incorrect');
    };

    const existiingSession = await this.findRefreshSession(user, fp);

    if (existiingSession){
      this.deleteRefreshSession(user, fp);
    };
    
    // Create tokens
    const tokens = await this.getTokens(user.id, user.login);
    await this.createRefreshSession(
      user,
      tokens.refreshToken,
      ua,
      ip,
      fp
    );
    return tokens;
  };


  async logout(userId: string, fp: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      AuthsService.logger.error(`User with id: ${userId} - not found. Cannot delete refreshToken`);
      throw new Error('User not found');
    };

    AuthsService.logger.log(`Deleting user ${userId} session`);
    return this.refreshSessionRepository.delete({ user, fingerprint: fp });
  };


  async generateFingerprint(ip: string, ua: string): Promise<string> {
    const hash = await argon2.hash(ip + ua);
    return hash;
  };


  hashData(data: string) {
    return argon2.hash(data);
  };


  async createRefreshSession(
    user: UserEntity,
    refreshToken: string,
    userAgent: string,
    ip: string,
    fingerprint: string,
  ) {
    // Hash token
    const hashedRefreshToken = await this.hashData(refreshToken);

    const refreshTokenTTL = this.configService.get<string>('REFRESH_TOKEN_TTL') || '3d'
    const ttl = AuthsService.parseTTL(refreshTokenTTL);

    this.refreshSessionRepository.save({
      user,
      refreshToken: hashedRefreshToken,
      userAgent,
      ip,
      fingerprint,
      expiresAt: ttl
    });
  };


  async refreshTokens(
    userId: string,
    refreshToken: string,
    userAgent: string,
    ip: string,
    fingerprint: string,
  ) {
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      AuthsService.logger.log(`Access denied for user id: ${userId}. No such user`);
      throw new ForbiddenException('Access Denied');
    };

    // Verifing refresh token
    const session = await this.findRefreshSession(user, fingerprint);

    if (!session) {
      AuthsService.logger.log(`Access denied for user: ${user.id}. No existing session`);
      throw new ForbiddenException('Access Denied');
    };

    // Check if token has expired
    const currentTime = new Date();
    console.log(currentTime)
    console.log(session.expiresAt)
    if (session.expiresAt < currentTime) {
      AuthsService.logger.log(`Access denied for user: ${user.id}. Refresh token expired`);
      throw new ForbiddenException('Refresh token expired');
    }

    const refreshTokenMatches = await argon2.verify(
      session.refreshToken,
      refreshToken
    );

    if (!refreshTokenMatches) {
      AuthsService.logger.log(`Access denied for user: ${user.id}. Incorrect refresh token`);
      throw new ForbiddenException('Access Denied');
    };

    // Create new refreshToken session
    const tokens = await this.getTokens(user.id, user.login);
    await this.createRefreshSession(
      user,
      tokens.refreshToken,
      userAgent,
      ip,
      fingerprint,
    );

    this.deleteRefreshSession(user, fingerprint);

    AuthsService.logger.debug(`Created new jwt tokens: ${tokens}`);
    return tokens;
  };


  async findRefreshSession(user: UserEntity, fp: string){
    const session = await this.refreshSessionRepository.findOne(
      { 
        where: { user: { id: user.id }, fingerprint: fp }
      }
    );

    AuthsService.logger.log(`Finded session for user id: ${user.id}`);
    return session;
  };


  async getTokens(userId: string, login: string) {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET')
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')

    if (!accessSecret || !refreshSecret){
      console.log(accessSecret)
      AuthsService.logger.error(`Access/Refresh token secret - not found in env`);
      throw new Error('No access or refresh token secret');
    }

    const refreshTokenTTL = this.configService.get<string>('REFRESH_TOKEN_TTL') || '3d'
    const accessTokenTTL = this.configService.get<string>('ACCESS_TOKEN_TTL') || '15m'

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          login,
        },
        {
          secret: accessSecret,
          expiresIn: accessTokenTTL,
        },
      ),
      
      this.jwtService.signAsync(
        {
          sub: userId,
          login,
        },
        {
          secret: refreshSecret,
          expiresIn: refreshTokenTTL,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  };


  async deleteRefreshSession(user: UserEntity, fp: string){
    AuthsService.logger.debug(`Deleting session of user id: ${user.id}, fp: ${fp}`);
    return this.refreshSessionRepository.delete({ user: { id: user.id }, fingerprint: fp });
  }


  private static parseTTL(ttl: string): Date {
    const ttlUnit = ttl.slice(-1);
    const ttlValue = parseInt(ttl.slice(0, -1), 10);

    let expirationDate: Date = new Date();

    switch (ttlUnit) {
      case 'd': // дни
        expirationDate = addDays(expirationDate, ttlValue);
        break;
      case 'h': // часы
        expirationDate = addHours(expirationDate, ttlValue);
        break;
      case 'm': // минуты
        expirationDate = addMinutes(expirationDate, ttlValue);
        break;
      default:
        AuthsService.logger.error('Invalid TTL format');
        throw new Error('Invalid TTL format');
    };

    return expirationDate;
  };
};
