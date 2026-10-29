import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { UpdateAuthDto } from './dto/update-auth.dto.js';
import { UsersService } from '../users/users.service.js';
import { CreateUserDto } from '../users/dto/create-user.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    private readonly usersService: UsersService,

  ) { }

  @Post('login')
  create(@Body() LoginDto: LoginDto) {
    return this.authService.login(LoginDto);
  }

  @Post('signup')
  register(@Body() CreateUserDto: CreateUserDto) {
    return this.usersService.create(CreateUserDto);
  }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
