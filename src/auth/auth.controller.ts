import { Body, Controller, Ip, Post, Headers, Request, UseGuards, Res, Delete } from '@nestjs/common';
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { RefreshTokenGuard } from 'src/guards/refreshToken.guard';
import { Response } from 'express';
import { refreshCookieOptions } from 'src/configs/cookie.config';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiBody({
    description: 'Данные для регистрации акаунта',
    type: CreateUserDto
  })
  @ApiResponse({ status: 201, description: 'Пользователь успешно зарегистрирован' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiHeader({ name: 'user-agent', description: 'User-Agent заголовок', required: true })
  @ApiHeader({ name: 'x-fingerprint', description: 'Уникальный отпечаток устройства', required: true })
  async signup(
    @Headers('user-agent') userAgent: string,
    @Headers('x-fingerprint') fingerprint: string,
    @Ip() ip: string,
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response
  ) {
    const tokens = await this.authService.signUp(
      createUserDto, userAgent, ip, fingerprint
    );

    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

    return res.json({ accessToken: tokens.accessToken });
  };


  @Post('signin')
  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiBody({ 
    description: 'Данные для входа в аккаунт',
    type: AuthDto
  })
  @ApiResponse({ status: 200, description: 'Успешный вход' })
  @ApiResponse({ status: 401, description: 'Неверные учетные данные' })
  @ApiHeader({ name: 'user-agent', description: 'User-Agent заголовок', required: true })
  @ApiHeader({ name: 'x-fingerprint', description: 'Уникальный отпечаток устройства', required: true })
  async signin(
    @Headers('user-agent') userAgent: string,
    @Headers('x-fingerprint') fingerprint: string,
    @Ip() ip: string,
    @Body() authDto: AuthDto,
    @Res() res: Response
  ) {
    const tokens = await this.authService.signIn(
      authDto, userAgent, ip, fingerprint
    );

    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

    return res.json({ accessToken: tokens.accessToken });
  };

  
  @UseGuards(AccessTokenGuard)
  @Delete('logout')
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({ status: 200, description: 'Успешный выход' })
  @ApiResponse({ status: 401, description: 'Неавторизованный запрос' })
  @ApiHeader({ name: 'x-fingerprint', description: 'Уникальный отпечаток устройства', required: true })
  async logout(
    @Headers('x-fingerprint') fingerprint: string,
    @Request() req,
    @Res() res: Response
  ) {
    const userId = req.user['sub'];

    await this.authService.deleteRefreshSession(userId, fingerprint);
    res.clearCookie('refreshToken', { path: '/' });

    return res.status(200).send({ message: 'Succesfully logout' });
  };


  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiResponse({ status: 200, description: 'Токены обновлены' })
  @ApiResponse({ status: 401, description: 'Недействительный refreshToken' })
  @ApiHeader({ name: 'user-agent', description: 'User-Agent заголовок', required: true })
  @ApiHeader({ name: 'x-fingerprint', description: 'Уникальный отпечаток устройства', required: true })
  async refreshTokens(
    @Request() req,
    @Headers('user-agent') userAgent: string,
    @Headers('x-fingerprint') fingerprint: string,
    @Ip() ip: string,
    @Res() res: Response
  ) {
    const userId = req.user['sub'];
    const refreshToken = req.cookies['refreshToken'];
    
    const tokens = await this.authService.refreshTokens(
      userId, refreshToken, userAgent, ip, fingerprint
    );

    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);

    return res.json({ accessToken: tokens.accessToken });
  };
};
