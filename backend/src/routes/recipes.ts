import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authMiddleware } from '../middleware/auth';
import { createRecipeSchema, updateRecipeSchema, importRecipeSchema } from '../schemas';
import { recipesService } from '../services/recipes.service';
import { recipeImportService } from '../services/recipe-import.service';

type JwtVariables = { jwtPayload: { sub: string; username: string } };

const recipes = new Hono<{ Variables: JwtVariables }>();

recipes.use('*', authMiddleware);

recipes.get('/', async (c) => {
  const userId = c.get('jwtPayload').sub;
  const search = c.req.query('search');
  return c.json(await recipesService.findAll(userId, search));
});

recipes.get('/shuffle', async (c) => {
  const userId = c.get('jwtPayload').sub;
  const count = Number(c.req.query('count') ?? '1');
  return c.json(await recipesService.shuffle(userId, count));
});

recipes.post('/import', zValidator('json', importRecipeSchema), async (c) => {
  const { url } = c.req.valid('json');
  return c.json(await recipeImportService.createDraft(url));
});

recipes.post('/', zValidator('json', createRecipeSchema), async (c) => {
  const userId = c.get('jwtPayload').sub;
  const dto = c.req.valid('json');
  return c.json(await recipesService.create(userId, dto), 201);
});

recipes.get('/:id', async (c) => {
  const userId = c.get('jwtPayload').sub;
  return c.json(await recipesService.findOne(userId, c.req.param('id')));
});

recipes.patch('/:id', zValidator('json', updateRecipeSchema), async (c) => {
  const userId = c.get('jwtPayload').sub;
  const dto = c.req.valid('json');
  return c.json(await recipesService.update(userId, c.req.param('id'), dto));
});

recipes.delete('/:id', async (c) => {
  const userId = c.get('jwtPayload').sub;
  return c.json(await recipesService.remove(userId, c.req.param('id')));
});

export default recipes;
