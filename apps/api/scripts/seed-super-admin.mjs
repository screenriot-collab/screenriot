import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(__dirname, '..');
config({ path: resolve(apiDir, '../../.env') });
config({ path: resolve(apiDir, '.env') });

// Load Prisma client from api's node_modules (custom output in schema)
const requireApi = createRequire(pathToFileURL(resolve(apiDir, 'package.json')).href);
const { PrismaClient } = requireApi(resolve(apiDir, 'node_modules/.prisma/client'));
const { PrismaPg } = requireApi('@prisma/adapter-pg');
const bcrypt = requireApi('bcrypt');

const datasourceUrl = process.env.DATABASE_URL;
if (!datasourceUrl) {
  console.error('DATABASE_URL is not set. Load .env from repo root or set env.');
  process.exit(1);
}
const adapter = new PrismaPg({ connectionString: datasourceUrl });
const prisma = new PrismaClient({ adapter });
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
      role: 'super_admin',
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
