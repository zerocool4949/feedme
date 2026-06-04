import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { changePasswordSchema, loginSchema } from '../schemas';
import { authMiddleware } from '../middleware/auth';
import { changePassword, login } from '../services/auth.service';

type JwtVariables = { jwtPayload: { sub: string; username: string } };

const auth = new Hono<{ Variables: JwtVariables }>();

auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { username, password } = c.req.valid('json');
  const result = await login(username, password);
  return c.json(result);
});

auth.patch('/password', authMiddleware, zValidator('json', changePasswordSchema), async (c) => {
  const userId = c.get('jwtPayload').sub;
  return c.json(await changePassword(userId, c.req.valid('json')));
});

export default auth;
