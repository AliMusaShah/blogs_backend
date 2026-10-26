import { Transform } from 'class-transformer';
import {
  ArrayMaxSize, ArrayUnique, IsArray, IsNotEmpty, IsNumberString,
  IsOptional, IsString, Length, Matches, MaxLength,
} from 'class-validator';
import { TAG_REGEX } from '../../common/constants.js';
import { trim, trimLowerEach } from '../../common/transforms.js';

export class CreatePostDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50000)
  content: string;

  // ids are strings in JSON because BigInt can't be sent as a number
  @IsNumberString({ no_symbols: true }, { message: 'authorId must be a numeric id string' })
  authorId: string;

  @IsOptional()
  @Transform(trimLowerEach) // " NestJS " becomes "nestjs" before it is checked
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique()
  @IsString({ each: true })
  @Length(1, 50, { each: true })
  @Matches(TAG_REGEX, {
    each: true,
    message: 'each tag must be lowercase letters, numbers and single hyphens',
  })
  tags?: string[];
}