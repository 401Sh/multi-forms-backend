import { Body, Controller, Ip, Post, Headers, Request, UseGuards, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
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
  @Post('logout')
  async logout(
    @Headers('x-fingerprint') fingerprint: string,
    @Request() req,
    @Res() res: Response
  ) {
    await this.authService.logout(req.user['sub'], fingerprint);
    res.clearCookie('refreshToken', { path: '/' });

    return res.status(200).send({ message: 'Succesfully logout' });
  };


  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
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
