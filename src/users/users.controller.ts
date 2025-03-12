import { Body, Controller, Get, Param, UseGuards, Request, Delete, HttpStatus, Patch, Res, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}


  @ApiOperation({ summary: 'Получить всех пользователей' })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей успешно получен'
  })
  @UseGuards(AccessTokenGuard)
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  };
  

  @ApiOperation({ summary: 'Получить данные о себе' })
  @ApiResponse({
    status: 200,
    description: 'Информация о пользователе успешно получена'
  })
  @UseGuards(AccessTokenGuard)
  @Get('self')
  async findMe(@Request() req) {
    const userId = req.user['sub'];
    return await this.usersService.findById(userId);
  };


  @ApiOperation({ summary: 'Найти пользователя по ID' })
  @ApiParam({
    name: 'userId',
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
  @UseGuards(AccessTokenGuard)
  @Get(':userId')
  async findById(@Param('userId', ParseUUIDPipe) userId: string) {
    return await this.usersService.findById(userId);
  };


  @ApiOperation({ summary: 'Обновить данные о себе' })
  @ApiBody({
    description: 'Данные для обновления пользователя',
    type: UpdateUserDto,
  })
  @ApiResponse({ status: 200, description: 'Пользователь успешно обновлен' })
  @UseGuards(AccessTokenGuard)
  @Patch('self')
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


  @ApiOperation({ summary: 'Удалить свой аккаунт' })
  @ApiResponse({ status: 204, description: 'Пользователь успешно удален' })
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
