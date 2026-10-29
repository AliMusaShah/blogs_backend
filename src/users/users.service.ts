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
    return this.prisma.user.create({
      data: { name: dto.name, email: dto.email, passwordHash },
      select: userSelect,
    });                       // a duplicate email now becomes 409 by itself
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
  }

  async update(id: bigint, dto: UpdateUserDto) {
    return this.prisma.user.update({ where: { id }, data: { ...dto }, select: userSelect });
  }

  async remove(id: bigint): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

}
