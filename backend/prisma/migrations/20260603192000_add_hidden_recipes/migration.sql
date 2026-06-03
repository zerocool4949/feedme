CREATE TABLE "hidden_recipes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "recipe_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hidden_recipes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "hidden_recipes_recipe_id_idx" ON "hidden_recipes"("recipe_id");

CREATE UNIQUE INDEX "hidden_recipes_user_id_recipe_id_key" ON "hidden_recipes"("user_id", "recipe_id");

ALTER TABLE "hidden_recipes" ADD CONSTRAINT "hidden_recipes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "hidden_recipes" ADD CONSTRAINT "hidden_recipes_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
