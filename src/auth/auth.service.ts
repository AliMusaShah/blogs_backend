import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto.js';
import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { JwtService } from '@nestjs/jwt';

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

    console.log("user: ", user)
    // // If no user is found, throw an error
    if (!user) {
      throw new NotFoundException(`No user found for email: ${LoginDto.email}`);

    }
    // // Step 2: Check if the password is correct
    // const isPasswordValid = user.passwordHash === LoginDto.password;

    // // If password does not match, throw an error
    // if (!isPasswordValid) {
    //   throw new UnauthorizedException('Invalid password');
    // }


    return {
      accessToken: this.jwtService.sign({ userId: user.id }),
    };
  }

}
