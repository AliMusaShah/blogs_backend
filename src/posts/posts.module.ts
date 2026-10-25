import { Module } from '@nestjs/common';
import { PostsService } from './posts.service.js';
import { PostsController } from './posts.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  controllers: [PostsController],
  providers: [PostsService],
  imports: [PrismaModule],

})
export class PostsModule { }
