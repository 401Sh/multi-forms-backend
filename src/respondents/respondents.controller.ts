import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('respondents')
@Controller('respondents')
export class RespondentsController {}
