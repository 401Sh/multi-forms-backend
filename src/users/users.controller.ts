import { Body, Controller, Get, Param, UseGuards, Request, Delete, HttpStatus, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}


  @UseGuards(AccessTokenGuard)
  @Get('me')
  async getMe(@Request() req) {
    const userId = req.user['sub'];
    return await this.usersService.findById(userId);
  };


  @UseGuards(AccessTokenGuard)
  @Get('all')
  async getAll() {
    return await this.usersService.findAll();
  };


  @UseGuards(AccessTokenGuard)
  @Get(':id')
  async getOne(@Param('id') id: string) {
    return await this.usersService.findById(id);
  };


  @UseGuards(AccessTokenGuard)
  @Patch('me')
  async updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    const userId = req.user['sub'];
    const login = await this.usersService.update(userId, updateUserDto);

    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      user: login,
    };
  };


  @UseGuards(AccessTokenGuard)
  @Delete('me')
  async deleteMe(@Request() req) {
    const userId = req.user['sub'];
    await this.usersService.deleteById(userId);

    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'User deleted successfully',
    };
  };
};
