import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { RecipesModule } from './recipes/recipes.module';

@Module({
  imports: [PrismaModule, RecipesModule],
  controllers: [HealthController],
})
export class AppModule {}
