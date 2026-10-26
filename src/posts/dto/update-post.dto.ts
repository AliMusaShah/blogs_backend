import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto.js';

// the author of a post can never change, so authorId is removed
export class UpdatePostDto extends PartialType(OmitType(CreatePostDto, ['authorId'] as const)) {}