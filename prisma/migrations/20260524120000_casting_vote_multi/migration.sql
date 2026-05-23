-- Allow one vote per user per actor option (multi-vote per film).
DROP INDEX IF EXISTS "film_casting_votes_film_id_user_id_key";

CREATE UNIQUE INDEX IF NOT EXISTS "film_casting_votes_film_id_user_id_option_id_key"
    ON "film_casting_votes"("film_id", "user_id", "option_id");
