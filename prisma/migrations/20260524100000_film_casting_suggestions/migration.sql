-- CreateEnum
CREATE TYPE "CastingSuggestionStatus" AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');

-- CreateTable
CREATE TABLE IF NOT EXISTS "film_casting_suggestions" (
    "id" TEXT NOT NULL,
    "film_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "actor_name" TEXT NOT NULL,
    "role_hint" TEXT,
    "status" "CastingSuggestionStatus" NOT NULL DEFAULT 'pending',
    "admin_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "film_casting_suggestions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "film_casting_suggestions_film_id_idx" ON "film_casting_suggestions"("film_id");
CREATE INDEX IF NOT EXISTS "film_casting_suggestions_user_id_idx" ON "film_casting_suggestions"("user_id");
CREATE INDEX IF NOT EXISTS "film_casting_suggestions_status_idx" ON "film_casting_suggestions"("status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'film_casting_suggestions_film_id_fkey'
  ) THEN
    ALTER TABLE "film_casting_suggestions" ADD CONSTRAINT "film_casting_suggestions_film_id_fkey"
      FOREIGN KEY ("film_id") REFERENCES "films"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'film_casting_suggestions_user_id_fkey'
  ) THEN
    ALTER TABLE "film_casting_suggestions" ADD CONSTRAINT "film_casting_suggestions_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
