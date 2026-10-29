import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import * as bcrypt from 'bcrypt';
import { Prisma } from '../generated/prisma/client.js';
import { QueryUsersDto } from './dto/query-users.dto.js';


const SALT_ROUNDS = 10;


const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }


  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    try {
      return await this.prisma.user.create({
        data: { name: dto.name, email: dto.email, passwordHash },
        select: userSelect,
      });
    } catch (e) {
      throw this.mapError(e);

    }
  }

  async findAll(query: QueryUsersDto) {
    const { page, limit, search } = query;

    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { items, total, page, limit };
  }

  async findOne(id: number) {

    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          ...userSelect,
          posts: {
            select: { id: true, title: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
          },
          comments: {
            select: { id: true, text: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      );
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return user;

    } catch (e) {
      throw this.mapError(e)
    }
  }

  async update(id: bigint, updateUserDto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: { ...updateUserDto },
        select: userSelect,
      });
    } catch (e) {
      throw this.mapError(e, id);
    }
  }

  async remove(id: bigint) {
    try {
      await this.prisma.user.delete({ where: { id } });
      return {
        message: `user deleted with id ${id}`
      }
    } catch (e) {
      throw this.mapError(e, id);
    }
  }


  private mapError(e: unknown, id?: bigint): unknown {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      switch (e.code) {
        case 'P2002': // unique constraint (email)
          return new ConflictException('Email is already in use');
        case 'P2025': // record not found
          return new NotFoundException(`User with id ${id} not found`);
        case 'P2003': // foreign key (onDelete: Restrict)
          return new ConflictException('User still has posts or comments and cannot be deleted');
      }
    }
    return e;
  }
}
