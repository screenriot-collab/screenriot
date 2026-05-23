-- CreateTable
CREATE TABLE IF NOT EXISTS "script_credit_purchases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "stripe_session_id" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "script_credit_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "script_credit_purchases_stripe_session_id_key" ON "script_credit_purchases"("stripe_session_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "script_credit_purchases_user_id_idx" ON "script_credit_purchases"("user_id");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'script_credit_purchases_user_id_fkey'
  ) THEN
    ALTER TABLE "script_credit_purchases" ADD CONSTRAINT "script_credit_purchases_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
