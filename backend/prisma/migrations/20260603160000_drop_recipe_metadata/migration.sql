ALTER TABLE "recipes" DROP COLUMN "status";
ALTER TABLE "recipes" DROP COLUMN "difficulty";
ALTER TABLE "recipes" DROP COLUMN "rating";
ALTER TABLE "recipes" DROP COLUMN "prep_time_minutes";
ALTER TABLE "recipes" DROP COLUMN "cook_time_minutes";
ALTER TABLE "recipes" DROP COLUMN "servings";
DROP TYPE "RecipeStatus";
DROP TYPE "RecipeDifficulty";
