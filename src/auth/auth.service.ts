import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
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
export class AuthService {
  private static readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(RefreshSessionEntity)
    private refreshSessionRepository: Repository<RefreshSessionEntity>,

    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}


  /**
   * Sign up user with creating session and tokens
   * @param {CreateUserDto} createUserDto User login and password
   * @param {string} ua User agent
   * @param {string} ip User ip address
   * @param {string} fp User fingerprint
   * @returns {Promise<{accessToken: string; refreshToken: string; }>} Created tokens
   */
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


  /**
   * Sign in user with creating session and tokens
   * @param {AuthDto} authDto User login and password
   * @param {string} ua User agent
   * @param {string} ip User ip address
   * @param {string} fp User fingerprint
   * @returns {Promise<{accessToken: string; refreshToken: string; }>} Created tokens
   */
  async signIn(authDto: AuthDto, ua: string, ip: string, fp: string) {
    // Check if user exists
    const user = await this.usersService.findByLogin(authDto.login);

    if (!user) throw new BadRequestException('User does not exist');

    // Verify password
    const verifiedPassword = await argon2.verify(user.password, authDto.password);
    if (!verifiedPassword){
      throw new BadRequestException('Password is incorrect');
    };

    const existiingSession = await this.findRefreshSession(user.id, fp);

    if (existiingSession){
      await this.deleteRefreshSession(user.id, fp);
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


  /**
   * Create simple fingerprint for user in hashed form
   * @param {string} ip User ip address
   * @param {string} ua User agent
   * @returns {Promise<string>} Created fingerprint
   */
  async generateFingerprint(ip: string, ua: string): Promise<string> {
    const hash = await argon2.hash(ip + ua);
    return hash;
  };


  /**
   * Hash data
   * @param {string} data Data to hash
   * @returns {Promise<string>} Hashed string
   */
  hashData(data: string): Promise<string> {
    return argon2.hash(data);
  };


  /**
   * Create user session in DB
   * @param {UserEntity} user User entity
   * @param {string} refreshToken Working refresh token
   * @param {string} userAgent User agent
   * @param {string} ip User ip address
   * @param {string} fingerprint User fingerprint
   */
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
    const ttl = AuthService.parseTTL(refreshTokenTTL);

    const session = await this.refreshSessionRepository.save({
      user,
      refreshToken: hashedRefreshToken,
      userAgent,
      ip,
      fingerprint,
      expiresAt: ttl
    });

    return session;
  };


  /**
   * Refresh user tokens with creating new session
   * @param {string} userId User uuid
   * @param {string} refreshToken Working refresh token
   * @param {string} userAgent User agent
   * @param {string} ip User ip address
   * @param {string} fingerprint User fingerprint
   * @returns {Promise<{accessToken: string; refreshToken: string; }>} New tokens
   */
  async refreshTokens(
    userId: string,
    refreshToken: string,
    userAgent: string,
    ip: string,
    fingerprint: string,
  ) {
    const user = await this.usersService.findById(userId);
    
    if (!user) {
      AuthService.logger.log(`Access denied for user id: ${userId}. No such user`);
      throw new ForbiddenException('Access Denied');
    };

    // Verifing refresh token
    const session = await this.findRefreshSession(user.id, fingerprint);
    
    if (!session) {
      AuthService.logger.log(`Access denied for user: ${user.id}. No existing session`);
      throw new ForbiddenException('Access Denied');
    };

    // Check if token has expired
    const currentTime = new Date();
    console.log(currentTime)
    console.log(session.expiresAt)
    if (session.expiresAt < currentTime) {
      AuthService.logger.log(`Access denied for user: ${user.id}. Refresh token expired`);
      throw new ForbiddenException('Refresh token expired');
    }

    const refreshTokenMatches = await argon2.verify(
      session.refreshToken,
      refreshToken
    );

    if (!refreshTokenMatches) {
      AuthService.logger.log(`Access denied for user: ${user.id}. Incorrect refresh token`);
      throw new ForbiddenException('Access Denied');
    };

    await this.deleteRefreshSession(user.id, fingerprint);

    // Create new refreshToken session
    const tokens = await this.getTokens(user.id, user.login);
    await this.createRefreshSession(
      user,
      tokens.refreshToken,
      userAgent,
      ip,
      fingerprint,
    );

    AuthService.logger.debug(`Created new jwt tokens for user ${user.id}`);
    return tokens;
  };


  /**
   * Find session in DB which belonging to specific user
   * with specific fingerprint
   * @param {string} userId User uuid
   * @param {string} fp User fingerprint
   * @returns {Promise<RefreshSessionEntity | null>} Finded session
   */
  async findRefreshSession(userId: string, fp: string){
    const session = await this.refreshSessionRepository.findOne(
      { 
        where: { user: { id: userId }, fingerprint: fp }
      }
    );
    
    AuthService.logger.log(`Finded session for user id: ${userId}`);
    return session;
  };


  /**
   * Create access and refresh tokens for given user
   * @param {string} userId User uuid
   * @param {string} login User login
   * @returns {Promise<{accessToken: string; refreshToken: string; }>} Created tokens
   */
  async getTokens(userId: string, login: string) {
    const accessSecret = this.configService.get<string>('JWT_ACCESS_SECRET')
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET')

    if (!accessSecret || !refreshSecret){
      console.log(accessSecret)
      AuthService.logger.error(`Access/Refresh token secret - not found in env`);
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


  /**
   * Delete refresh session in DB which belonging to specific user
   * with specific fingerprint
   * @param {string} userId User uuid
   * @param {string} fp User fingerprint
   * @returns {Promise<DeleteResult>} Deleting result
   */
  async deleteRefreshSession(userId: string, fp: string){
    AuthService.logger.log(`Deleting user ${userId} session`);
    const deleteResult = await this.refreshSessionRepository.delete(
      { user: { id: userId },
      fingerprint: fp }
    );

    if (deleteResult.affected === 0) {
      AuthService.logger.debug(
        `Cannot delete session.
         No session with user id: ${userId} and fingerprint ${fp}`);
      throw new NotFoundException('Session not found');
    };

    return deleteResult;
  }


  /**
   * Parse given ttl code and return Date
   * @param {string} ttl TTL string to parse
   * @returns {Date} Parsed TTL
   */
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
        AuthService.logger.error('Invalid TTL format');
        throw new Error('Invalid TTL format');
    };

    return expirationDate;
  };
};
