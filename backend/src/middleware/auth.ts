import { jwt } from 'hono/jwt';

export const authMiddleware = jwt({
  secret: process.env.JWT_SECRET ?? 'feedme-dev-secret',
  alg: 'HS256',
});
