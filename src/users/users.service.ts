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

  
  /**
   * Create new user in DB
   * @param {CreateUserDto} createUserDto User login and password
   * @returns {Promise<UserEntity>} Created user
   */
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
    UsersService.logger.debug('Created user', user);
    return user;
  };


  /**
   * Find all existing users
   * @returns {Promise<UserEntity[]>} Finded users entities
   */
  async findAll(): Promise<UserEntity[]> {
    UsersService.logger.log(`Finding all users`);
    const users = await this.userRepository
      .createQueryBuilder('users')
      .select(['users.login', 'users.id'])
      .getMany();
    return users;
  };


  /**
   * Find user in DB by id
   * @param {string} id User uuid
   * @returns {Promise<UserEntity>} Finded user entity
   */
  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository
      .createQueryBuilder('users')
      .where('users.id = :id', { id })
      .select(['users.login', 'users.id'])
      .getOne();

    if (!user) {
      UsersService.logger.log(`No user with id: ${id}`);
      throw new BadRequestException('User does not exist');
    };

    UsersService.logger.log(`Finded user with id: ${id}`);
    return user;
  };


  /**
   * Find user in DB by login
   * @param {string} login User login
   * @returns {Promise<UserEntity>} Finded user entity
   */
  async findByLogin(login: string): Promise<UserEntity> {
    const user = await this.userRepository
      .createQueryBuilder('users')
      .where('users.login = :login', { login })
      .select(['users.id', 'users.login', 'users.password'])
      .getOne();

    if (!user) {
      UsersService.logger.log(`No user with login: ${login}`);
      throw new BadRequestException('User does not exist');
    };

    UsersService.logger.log(`Finded user with login: ${login}`);
    return user;
  }


  /**
   * Update user data in DB
   * @param {string} id User uuid
   * @param {UpdateUserDto} updateUserDto Data for update
   * @returns {Promise<UserEntity | null>} Updated user entity
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity | null> {
    // Check user
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      UsersService.logger.log(`Cannot update user. No user with id: ${id}`);
      throw new NotFoundException('User not found');
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
    return updatedUser;
  };


  /**
   * Delete user in DB by id
   * @param {string} id User uuid
   * @returns {Promise<DeleteResult>} Deleting result
   */
  async deleteById(id: string): Promise<DeleteResult> {
    UsersService.logger.log(`Deleting user with id: ${id}`);
    const deleteResult = await this.userRepository.delete({ id: id });

    if (deleteResult.affected === 0) {
      UsersService.logger.log(`Cannot delete user. No user with id: ${id}`);
      throw new NotFoundException('User not found');
    };

    return deleteResult;
  };


  /**
   * Check if user login is free in DB
   * @param {string} login Verifiable login
   * @returns {Promise<boolean>} True if login is free
   */
  async isLoginAvailable(login: string): Promise<boolean> {
    const existingUser = await this.userRepository.findOne({ where: { login } });
    return !existingUser;
  };


  /**
   * Hash data
   * @param {string} data Data to hash
   * @returns {Promise<string>} Hashed string
   */
  hashData(data: string): Promise<string> {
    return argon2.hash(data);
  };
};
