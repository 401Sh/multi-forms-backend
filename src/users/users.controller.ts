import { Body, Controller, Get, Param, UseGuards, Request, Delete, HttpStatus, Patch, Res, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { pick } from 'lodash';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}


  @UseGuards(AccessTokenGuard)
  @Get()
  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей успешно получен'
  })
  async findAll() {
    return await this.usersService.findAll();
  };
  

  @UseGuards(AccessTokenGuard)
  @Get('self')
  @ApiOperation({ summary: 'Получить данные о себе' })
  @ApiResponse({
    status: 200,
    description: 'Информация о пользователе успешно получена'
  })
  async findMe(@Request() req) {
    const userId = req.user['sub'];
    const findedUser = await this.usersService.findById(userId);
    return pick(findedUser, 'login');
  };


  @UseGuards(AccessTokenGuard)
  @Get(':userId')
  @ApiOperation({ summary: 'Найти пользователя по ID' })
  @ApiParam({
    name: 'userId',
    type: 'string',
    format: 'uuid',
    required: true,
    description: 'UUID пользователя'
  })
  @ApiResponse({
    status: 200,
    description: 'Информация о пользователе успешно получена'
  })
  @ApiResponse({
    status: 404,
    description: 'Пользователь не найден'
  })
  async findById(@Param('userId', ParseUUIDPipe) userId: string) {
    const findedUser = await this.usersService.findById(userId);
    return pick(findedUser, 'login');
  };


  @UseGuards(AccessTokenGuard)
  @Patch('self')
  @ApiOperation({ summary: 'Обновить данные о себе' })
  @ApiBody({
    description: 'Данные для обновления пользователя',
    type: UpdateUserDto,
  })
  @ApiResponse({ status: 200, description: 'Пользователь успешно обновлен' })
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
  @ApiOperation({ summary: 'Удалить свой аккаунт' })
  @ApiResponse({ status: 204, description: 'Пользователь успешно удален' })
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
