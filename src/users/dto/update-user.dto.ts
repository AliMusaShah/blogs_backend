import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto.js';

// name and email may change, all optional; changing a password is a separate flow
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) { }