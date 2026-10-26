import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumberString, IsString, MaxLength } from 'class-validator';
import { trim } from '../../common/transforms.js';

export class CreateCommentDto {
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    text: string;

    @IsNumberString({ no_symbols: true }, { message: 'authorId must be a numeric id string' })
    authorId: string;
}