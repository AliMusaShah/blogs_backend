import { IsEnum } from 'class-validator';
import { Role } from '../../generated/prisma/client.js';

export class UpdateUserRoleDto {
    @IsEnum(Role)
    role: Role;
}