import { ConfigModule } from '@nestjs/config';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { PostsModule } from './posts/posts.module.js';
import { UsersModule } from './users/users.module.js';
import { CommentsModule } from './comments/comments.module.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { AuthModule } from './auth/auth.module.js';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, PostsModule, UsersModule, CommentsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
