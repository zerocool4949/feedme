import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import health from './routes/health';
import auth from './routes/auth';
import recipes from './routes/recipes';

const app = new Hono().basePath('/api');

app.use('*', cors());
app.route('/health', health);
app.route('/auth', auth);
app.route('/recipes', recipes);

serve({ fetch: app.fetch, port: Number(process.env.PORT ?? 3000) });
