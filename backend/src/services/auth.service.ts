import * as bcrypt from 'bcrypt';
import { sign } from 'hono/jwt';
import { HTTPException } from 'hono/http-exception';
import { prisma } from '../db';
import { ChangePasswordDto } from '../schemas';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET environment variable must be set');

const JWT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

export async function login(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user?.passwordHash) {
    throw new HTTPException(401, { message: 'Identifiants invalides' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new HTTPException(401, { message: 'Identifiants invalides' });
  }

  const token = await sign(
    { sub: user.id, username: user.username, exp: Math.floor(Date.now() / 1000) + JWT_TTL_SECONDS },
    JWT_SECRET,
    'HS256',
  );
  return { token };
}

export async function changePassword(userId: string, dto: ChangePasswordDto) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user?.passwordHash) {
    throw new HTTPException(401, { message: 'Session invalide' });
  }

  const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
  if (!valid) {
    throw new HTTPException(400, { message: 'Mot de passe actuel incorrect' });
  }

  const passwordHash = await bcrypt.hash(dto.newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { ok: true };
}
