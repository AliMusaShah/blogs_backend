import { PartialType } from '@nestjs/swagger';
import { LoginDto } from './login.dto.js';

export class UpdateAuthDto extends PartialType(LoginDto) { }
