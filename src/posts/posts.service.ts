import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { QueryPostsDto } from './dto/query-posts.dto.js';




const postInclude = {
  author: { select: { id: true, name: true } },
  tags: { include: { tag: { select: { name: true } } } },
  _count: { select: { comments: true } },
} satisfies Prisma.PostInclude;

// The single-post view adds the comments.
const postDetailInclude = {
  ...postInclude,
  comments: {
    orderBy: { createdAt: 'asc' },
    include: { author: { select: { id: true, name: true } } },
  },
} satisfies Prisma.PostInclude;

// Turns [{ tag: { name } }] into ["nest", "docs"] and _count into commentCount.
function shape<T extends { tags: { tag: { name: string } }[]; _count: { comments: number } }>(post: T) {
  const { tags, _count, ...rest } = post;
  return { ...rest, tags: tags.map((t) => t.tag.name), commentCount: _count.comments };
}
@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) { }


  async create(dto: CreatePostDto) {
    const authorId = BigInt(dto.authorId);

    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });
    if (!author) {
      throw new NotFoundException(`Author with id ${dto.authorId} not found`);
    }
    const post = await this.prisma.post.create({
      data: {
        title: dto.title,
        content: dto.content,
        author: { connect: { id: authorId } },
        tags: { create: this.tagLinks(dto.tags ?? []) },
      },
      include: postInclude,
    });
    return shape(post);

  }

  async findAll(query: QueryPostsDto) {
    const { page, limit, search, tag, authorId } = query;

    const where: Prisma.PostWhereInput = {};
    if (authorId) where.authorId = BigInt(authorId);
    if (tag) where.tags = { some: { tag: { name: tag } } };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Both queries run in one transaction, so total and items agree
    const [total, posts] = await this.prisma.$transaction([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        include: postInclude,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], // id keeps the order stable
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { items: posts.map(shape), total, page, limit };
  }

  async findOne(id: bigint) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: postDetailInclude,
    });
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return shape(post);
  }

  async update(id: bigint, dto: UpdatePostDto) {
    const { tags, ...fields } = dto;

    const data: Prisma.PostUpdateInput = { ...fields };
    if (tags) {
      // replace all tag links: remove the old ones, add the new ones (an empty list clears them)
      data.tags = { deleteMany: {}, create: this.tagLinks(tags) };
    }

    try {
      const post = await this.prisma.post.update({ where: { id }, data, include: postInclude });
      return shape(post);
    } catch (e) {
      this.throwIfNotFound(e, id);
      throw e;
    }
  }

  async remove(id: bigint): Promise<void> {
    try {
      // comments and tag links are deleted by the database (onDelete: Cascade)
      await this.prisma.post.delete({ where: { id } });
    } catch (e) {
      this.throwIfNotFound(e, id);
      throw e;
    }
  }
  // "use this tag if it exists, otherwise create it" for each name
  private tagLinks(names: string[]) {
    return names.map((name) => ({
      tag: { connectOrCreate: { where: { name }, create: { name } } },
    }));
  }

  // P2025 is Prisma's code for "the record to update or delete was not found"
  private throwIfNotFound(e: unknown, id: bigint) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
  }
}
