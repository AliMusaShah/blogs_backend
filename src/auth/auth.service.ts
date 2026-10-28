import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) { }

  async login(LoginDto: LoginDto) {
    // Step 1: Fetch a user with the given email
    const user = await this.prisma.user.findUnique({
      where: {
        email: LoginDto.email,
      }
    });

    console.log("LoginDto: ", LoginDto)
    // // If no user is found, throw an error
    if (!user) {
      throw new NotFoundException(`No user found for email: ${LoginDto.email}`);

    }

    // // Step 2: Check if the password is correct
    const passwordMatches = user
      ? await bcrypt.compare(LoginDto.password, user.passwordHash)
      : false;
    console.log("passwordMatches: ", passwordMatches)

    // // If password does not match, throw an error
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid password');
    }


    return {
      accessToken: this.jwtService.sign({ sub: user.id.toString() }),
    };
  }

}
