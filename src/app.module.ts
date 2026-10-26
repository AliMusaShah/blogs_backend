import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ConfigModule } from '@nestjs/config';
import { PostsModule } from './posts/posts.module.js';
import { UsersModule } from './users/users.module.js';
import { CommentsModule } from './comments/comments.module.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, PostsModule, UsersModule, CommentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
