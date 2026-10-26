import { Transform } from 'class-transformer';
import { IsNumberString, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { TAG_REGEX } from '../../common/constants.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { trim, trimLower } from '../../common/transforms.js';

export class QueryPostsDto extends PaginationDto {
    @IsOptional()
    @Transform(trim)
    @IsString()
    @MaxLength(100)
    search?: string;

    @IsOptional()
    @Transform(trimLower)
    @IsString()
    @Matches(TAG_REGEX, { message: 'tag must be lowercase letters, numbers and hyphens' })
    tag?: string;

    @IsOptional()
    @IsNumberString({ no_symbols: true })
    authorId?: string;
}