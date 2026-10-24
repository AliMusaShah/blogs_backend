// prisma/seed.ts
import 'dotenv/config';

import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '../generated/prisma/client.js';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({adapter});

async function main() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) {
        throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
        where: { email },
        update: {},                                   // already exists: change nothing
        create: { name: 'Admin', email, passwordHash, role: Role.ADMIN },
    });
}

main().finally(() => prisma.$disconnect());