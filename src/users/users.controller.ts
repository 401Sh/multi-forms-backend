import { Body, Controller, Get, Param, UseGuards, Request, Delete, HttpStatus, Patch, Res, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { pick } from 'lodash';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}


  @UseGuards(AccessTokenGuard)
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  };
  

  @UseGuards(AccessTokenGuard)
  @Get('self')
  async findMe(@Request() req) {
    const userId = req.user['sub'];
    const findedUser = await this.usersService.findById(userId);
    return pick(findedUser, 'login');
  };


  @UseGuards(AccessTokenGuard)
  @Get(':userId')
  async findById(@Param('userId', ParseUUIDPipe) userId: string) {
    const findedUser = await this.usersService.findById(userId);
    return pick(findedUser, 'login');
  };


  @UseGuards(AccessTokenGuard)
  @Patch('self')
  async updateMe(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    const userId = req.user['sub'];
    const updatedUser = await this.usersService.update(userId, updateUserDto);

    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      user: pick(updatedUser, 'login'),
    };
  };


  @UseGuards(AccessTokenGuard)
  @Delete('self')
  async deleteMe(
    @Request() req,
    @Res() res: Response
  ) {
    const userId = req.user['sub'];
    await this.usersService.deleteById(userId);

    res.clearCookie('refreshToken', { path: '/' });

    // for some reasons res.status(204).send() doesnt work
    return res.send({ message: 'User deleted successfully', statusCode: 204 });
  };
};
