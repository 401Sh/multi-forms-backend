import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
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

    const user = await this.userRepository.save({
      ...createUserDto
    });

    UsersService.logger.log(`Created user: ${createUserDto.login}`);
    UsersService.logger.debug('Created user: ', user);
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



  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .select(['user.id', 'user.login'])
      .getOne();

    if (!user) {
      UsersService.logger.log(`No user with id: ${id}`);
      throw new BadRequestException('User does not exist');
    };

    UsersService.logger.log(`Finded user with id: ${id}`);
    return user;
  };


  /**
   * Only for **internal** use
  */
  async findByLogin(login: string): Promise<UserEntity> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.login = :login', { login })
      .select(['user.id', 'user.login', 'user.password'])
      .getOne();

    if (!user) {
      UsersService.logger.log(`No user with login: ${login}`);
      throw new BadRequestException('User does not exist');
    };

    UsersService.logger.log(`Finded user with login: ${login}`);
    return user;
  }


  async update(id: string, updateUserDto: UpdateUserDto) {
    UsersService.logger.log(`Updating user with id: ${id}`);

    // Check user
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      UsersService.logger.log(`Cannot update user. No user with id: ${id}`);
      throw new NotFoundException(`User with id ${id} not found`);
    };

    // Check login
    if (updateUserDto.login) {
      const isAvailable = await this.isLoginAvailable(updateUserDto.login);
      if (!isAvailable) {
        throw new BadRequestException(`Login "${updateUserDto.login}" is already taken`);
      };
    };

    if (updateUserDto.password) {
      updateUserDto.password = await this.hashData(updateUserDto.password);
    };

    UsersService.logger.log(`Updating user with id: ${id}`);
    await this.userRepository.update({ id: id }, updateUserDto);

    const updatedUser = await this.userRepository.findOne({ where: { id } });
    return { login: updatedUser?.login };
  };


  async deleteById(id: string): Promise<DeleteResult> {
    UsersService.logger.log(`Deleting user with id: ${id}`);

    const deleteResult = await this.userRepository.delete({ id: id });

    if (deleteResult.affected === 0) {
      UsersService.logger.log(`Cannot delete user. No user with id: ${id}`);
      throw new NotFoundException(`User with id ${id} not found`);
    };

    return deleteResult;
  };


  async isLoginAvailable(login: string): Promise<boolean> {
    const existingUser = await this.userRepository.findOne({ where: { login } });
    return !existingUser;
  };


  hashData(data: string) {
    return argon2.hash(data);
  };
};
