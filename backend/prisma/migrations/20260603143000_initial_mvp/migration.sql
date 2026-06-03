CREATE TYPE "RecipeVisibility" AS ENUM ('private', 'public', 'shared');
CREATE TYPE "RecipeStatus" AS ENUM ('to_try', 'tested', 'favorite');
CREATE TYPE "RecipeDifficulty" AS ENUM ('easy', 'medium', 'hard');

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recipes" (
  "id" TEXT NOT NULL,
  "owner_user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "notes" TEXT,
  "instructions" TEXT NOT NULL,
  "prep_time_minutes" INTEGER,
  "cook_time_minutes" INTEGER,
  "servings" INTEGER,
  "source_url" TEXT,
  "image_url" TEXT,
  "visibility" "RecipeVisibility" NOT NULL DEFAULT 'private',
  "status" "RecipeStatus" NOT NULL DEFAULT 'to_try',
  "rating" INTEGER,
  "difficulty" "RecipeDifficulty",
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ingredients" (
  "id" TEXT NOT NULL,
  "recipe_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "normalized_name" TEXT NOT NULL,
  "quantity" TEXT,
  "unit" TEXT,
  "original_text" TEXT,
  CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "recipe_tags" (
  "id" TEXT NOT NULL,
  "recipe_id" TEXT NOT NULL,
  "tag" TEXT NOT NULL,
  CONSTRAINT "recipe_tags_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "recipes_owner_user_id_idx" ON "recipes"("owner_user_id");
CREATE INDEX "recipes_title_idx" ON "recipes"("title");
CREATE INDEX "ingredients_normalized_name_idx" ON "ingredients"("normalized_name");
CREATE INDEX "recipe_tags_tag_idx" ON "recipe_tags"("tag");
CREATE UNIQUE INDEX "recipe_tags_recipe_id_tag_key" ON "recipe_tags"("recipe_id", "tag");

ALTER TABLE "recipes" ADD CONSTRAINT "recipes_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ingredients" ADD CONSTRAINT "ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
