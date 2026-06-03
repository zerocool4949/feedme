import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const username = process.env.NEW_USERNAME;
const password = process.env.NEW_PASSWORD;

if (!username || !password) {
  console.error('Usage: NEW_USERNAME=xxx NEW_PASSWORD=yyy node scripts/create-user.mjs');
  process.exit(1);
}

const prisma = new PrismaClient();
const passwordHash = await bcrypt.hash(password, 12);

const user = await prisma.user.upsert({
  where: { username },
  update: { passwordHash },
  create: { username, email: `${username}@feedme.local`, passwordHash },
});

// Migrate recipes from the old default user if it exists and has no password
const defaultUser = await prisma.user.findFirst({
  where: { username: 'local', passwordHash: null, id: { not: user.id } },
});

if (defaultUser) {
  const count = await prisma.recipe.count({ where: { ownerUserId: defaultUser.id } });
  if (count > 0) {
    await prisma.recipe.updateMany({
      where: { ownerUserId: defaultUser.id },
      data: { ownerUserId: user.id },
    });
    await prisma.user.delete({ where: { id: defaultUser.id } });
    console.log(`Migrated ${count} recipes from default user to ${username}`);
  }
}

console.log(JSON.stringify({ id: user.id, username: user.username, action: 'created/updated' }));
await prisma.$disconnect();
