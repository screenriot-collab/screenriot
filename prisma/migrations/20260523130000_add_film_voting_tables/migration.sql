-- Tables were added to schema without a migration; required before review_text migration.

CREATE TABLE IF NOT EXISTS "film_casting_votes" (
    "id" TEXT NOT NULL,
    "film_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "option_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "film_casting_votes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "film_casting_votes_film_id_user_id_key"
    ON "film_casting_votes"("film_id", "user_id");

CREATE INDEX IF NOT EXISTS "film_casting_votes_film_id_idx" ON "film_casting_votes"("film_id");
CREATE INDEX IF NOT EXISTS "film_casting_votes_user_id_idx" ON "film_casting_votes"("user_id");

DO $$ BEGIN
    ALTER TABLE "film_casting_votes"
        ADD CONSTRAINT "film_casting_votes_film_id_fkey"
        FOREIGN KEY ("film_id") REFERENCES "films"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "film_casting_votes"
        ADD CONSTRAINT "film_casting_votes_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "film_pledge_votes" (
    "id" TEXT NOT NULL,
    "film_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "film_pledge_votes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "film_pledge_votes_film_id_user_id_key"
    ON "film_pledge_votes"("film_id", "user_id");

CREATE INDEX IF NOT EXISTS "film_pledge_votes_film_id_idx" ON "film_pledge_votes"("film_id");
CREATE INDEX IF NOT EXISTS "film_pledge_votes_user_id_idx" ON "film_pledge_votes"("user_id");

DO $$ BEGIN
    ALTER TABLE "film_pledge_votes"
        ADD CONSTRAINT "film_pledge_votes_film_id_fkey"
        FOREIGN KEY ("film_id") REFERENCES "films"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "film_pledge_votes"
        ADD CONSTRAINT "film_pledge_votes_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
