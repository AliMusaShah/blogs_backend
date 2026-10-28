import { Module } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy.js';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module.js';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [PrismaModule, PassportModule, UsersModule, JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '1d' },
  }),],
})
export class AuthModule { }
