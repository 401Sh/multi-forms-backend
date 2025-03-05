import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auths')
@Controller('auths')
export class AuthsController {}
