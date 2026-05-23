CREATE TABLE IF NOT EXISTS "film_discussion_comments" (
    "id" TEXT NOT NULL,
    "film_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "root_id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "upvote_count" INTEGER NOT NULL DEFAULT 0,
    "reply_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "film_discussion_comments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "film_discussion_upvotes" (
    "id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "film_discussion_upvotes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "film_discussion_upvotes_comment_id_user_id_key"
    ON "film_discussion_upvotes"("comment_id", "user_id");

CREATE INDEX IF NOT EXISTS "film_discussion_comments_film_id_idx"
    ON "film_discussion_comments"("film_id");

CREATE INDEX IF NOT EXISTS "film_discussion_comments_film_id_parent_id_idx"
    ON "film_discussion_comments"("film_id", "parent_id");

CREATE INDEX IF NOT EXISTS "film_discussion_comments_root_id_idx"
    ON "film_discussion_comments"("root_id");

CREATE INDEX IF NOT EXISTS "film_discussion_comments_root_id_created_at_idx"
    ON "film_discussion_comments"("root_id", "created_at");

CREATE INDEX IF NOT EXISTS "film_discussion_upvotes_user_id_idx"
    ON "film_discussion_upvotes"("user_id");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'film_discussion_comments_film_id_fkey'
  ) THEN
    ALTER TABLE "film_discussion_comments" ADD CONSTRAINT "film_discussion_comments_film_id_fkey"
        FOREIGN KEY ("film_id") REFERENCES "films"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'film_discussion_comments_user_id_fkey'
  ) THEN
    ALTER TABLE "film_discussion_comments" ADD CONSTRAINT "film_discussion_comments_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'film_discussion_comments_parent_id_fkey'
  ) THEN
    ALTER TABLE "film_discussion_comments" ADD CONSTRAINT "film_discussion_comments_parent_id_fkey"
        FOREIGN KEY ("parent_id") REFERENCES "film_discussion_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'film_discussion_upvotes_comment_id_fkey'
  ) THEN
    ALTER TABLE "film_discussion_upvotes" ADD CONSTRAINT "film_discussion_upvotes_comment_id_fkey"
        FOREIGN KEY ("comment_id") REFERENCES "film_discussion_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'film_discussion_upvotes_user_id_fkey'
  ) THEN
    ALTER TABLE "film_discussion_upvotes" ADD CONSTRAINT "film_discussion_upvotes_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
