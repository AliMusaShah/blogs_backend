import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { trim } from '../../common/transforms.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

export class QueryUsersDto extends PaginationDto {
    @IsOptional()
    @Transform(trim)
    @IsString()
    @MaxLength(100)
    search?: string;
}