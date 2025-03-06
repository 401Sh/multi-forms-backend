import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  private static readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity>{
    const isAvailable = await this.isLoginAvailable(createUserDto.login);
    if (!isAvailable) {
      UsersService.logger.log(`Cannot create user. Login ${createUserDto.login} is already used`);
      throw new ConflictException(`Login ${createUserDto.login} is already used`);
    };

    if (createUserDto.password) {
      createUserDto.password = await this.hashData(createUserDto.password);
    }

    const user = this.userRepository.save({
      ...createUserDto
    });

    UsersService.logger.log(`Created user: ${createUserDto.login}`);
    UsersService.logger.debug(`Created user: ${user}`);
    return user;
  };


  async findAll(): Promise<UserEntity[]> {
    UsersService.logger.log(`Finding all users`);
    const users = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.login'])
      .getMany();
    return users;
  };


  // bad solution
  async findById(id: string) {
    const user = await this.userRepository.findOne({ where: { id: id } });
    if (!user) {
      UsersService.logger.log(`No user with id: ${id}`);
      return null;
    };

    UsersService.logger.log(`Finded user with id: ${id}`);
    return user;
  };


  async findByLogin(login: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({ where: { login: login } });
    if (!user) {
      UsersService.logger.log(`No user with login: ${login}`);
      return null;
    };

    UsersService.logger.log(`Finded user with login: ${login}`);
    return user;
  }


  async update(id: string, updateUserDto: UpdateUserDto) {
    UsersService.logger.log(`Updating user with id: ${id}`);

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashData(updateUserDto.password);
    }

    UsersService.logger.log(`Updating user with id: ${id}`);
    await this.userRepository.update({ id: id }, updateUserDto);

    const updatedUser = await this.userRepository
      .createQueryBuilder('user')
      .select(['user.login'])
      .getOne();
    return { login: updatedUser?.login };
  }


  async deleteById(id: string) {
    UsersService.logger.log(`Deleting user with id: ${id}`);
    return this.userRepository.delete({ id: id });
  };


  async isLoginAvailable(login: string): Promise<boolean> {
    const existingUser = await this.userRepository.findOne({ where: { login } });
    return !existingUser;
  };


  hashData(data: string) {
    return argon2.hash(data);
  };
};
