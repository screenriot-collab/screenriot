-- Script sample credits and per-page unlocks
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "script_credits" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "film_script_unlocks" (
    "id" TEXT NOT NULL,
    "film_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "film_script_unlocks_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "film_script_unlocks_film_id_user_id_page_id_key"
    ON "film_script_unlocks"("film_id", "user_id", "page_id");

CREATE INDEX IF NOT EXISTS "film_script_unlocks_film_id_idx" ON "film_script_unlocks"("film_id");
CREATE INDEX IF NOT EXISTS "film_script_unlocks_user_id_idx" ON "film_script_unlocks"("user_id");

ALTER TABLE "film_script_unlocks"
    ADD CONSTRAINT "film_script_unlocks_film_id_fkey"
    FOREIGN KEY ("film_id") REFERENCES "films"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "film_script_unlocks"
    ADD CONSTRAINT "film_script_unlocks_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
