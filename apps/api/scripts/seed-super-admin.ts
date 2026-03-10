import { config } from 'dotenv';
import { resolve } from 'path';

// Load root .env
config({ path: resolve(__dirname, '../../.env') });

import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  const username = process.env.SUPER_ADMIN_USERNAME ?? 'superAdmin';
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const email = process.env.SUPER_ADMIN_EMAIL;

  if (!password || !email) {
    console.log(
      'Skip super_admin seed: set SUPER_ADMIN_PASSWORD and SUPER_ADMIN_EMAIL to create initial super admin.',
    );
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { username },
  });
  if (existing) {
    console.log('Super admin already exists, skip seed.');
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await prisma.user.create({
    data: {
      username,
      email: email.toLowerCase(),
      passwordHash,
      role: UserRole.super_admin,
    },
  });
  console.log('Super admin created:', username);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
