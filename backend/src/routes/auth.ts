import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema } from '../schemas';
import { login } from '../services/auth.service';

const auth = new Hono();

auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { username, password } = c.req.valid('json');
  const result = await login(username, password);
  return c.json(result);
});

export default auth;
