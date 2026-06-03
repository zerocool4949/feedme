import * as bcrypt from 'bcrypt';
import { sign } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { prisma } from '../db';

const JWT_SECRET = process.env.JWT_SECRET ?? 'feedme-dev-secret';

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user?.passwordHash) {
    throw new HTTPException(401, { message: 'Identifiants invalides' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new HTTPException(401, { message: 'Identifiants invalides' });
  }

  const token = await sign({ sub: user.id, username: user.username }, JWT_SECRET, 'HS256');
  return { token };
}
