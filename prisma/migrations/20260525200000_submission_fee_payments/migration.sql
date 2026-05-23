-- CreateTable
CREATE TABLE IF NOT EXISTS "submission_fee_payments" (
    "id" TEXT NOT NULL,
    "film_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stripe_session_id" TEXT NOT NULL,
    "amount_usd" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "submission_fee_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "submission_fee_payments_film_id_key" ON "submission_fee_payments"("film_id");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "submission_fee_payments_stripe_session_id_key" ON "submission_fee_payments"("stripe_session_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "submission_fee_payments_user_id_idx" ON "submission_fee_payments"("user_id");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'submission_fee_payments_film_id_fkey'
  ) THEN
    ALTER TABLE "submission_fee_payments" ADD CONSTRAINT "submission_fee_payments_film_id_fkey"
      FOREIGN KEY ("film_id") REFERENCES "films"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'submission_fee_payments_user_id_fkey'
  ) THEN
    ALTER TABLE "submission_fee_payments" ADD CONSTRAINT "submission_fee_payments_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
