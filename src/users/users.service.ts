import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private static readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity>{
    // const isAvailable = await this.isLoginAvailable(userDto.login);
    // if (!isAvailable) {
    //   throw new ConflictException(`Login ${userDto.login} is already used`);
    // };

    const user = this.userRepository.save({
      ...createUserDto
    });

    UsersService.logger.log(`Created user: ${createUserDto.login}`);
    UsersService.logger.debug(`Created user: ${user}`);
    return user;
  };


  async findAll(): Promise<UserEntity[]> {
    UsersService.logger.log(`Finding all users`);
    return this.userRepository.find();
  };


  async findById(id: string): Promise<UserEntity | null> {
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


  async update(id: string, updateUserDto: UpdateUserDto): Promise<UpdateResult> {
    UsersService.logger.log(`Updating user with id: ${id}`);
    return this.userRepository.update({ id: id }, updateUserDto)
  }


  async deleteById(id: string): Promise<DeleteResult> {
    UsersService.logger.log(`Deleting user with id: ${id}`);
    return this.userRepository.delete({ id: id });
  };


  async isLoginAvailable(login: string): Promise<boolean> {
    const existingUser = await this.userRepository.findOne({ where: { login } });
    return !existingUser;
  };
};
