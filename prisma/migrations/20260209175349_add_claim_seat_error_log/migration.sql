/*
  Warnings:

  - The `status` column on the `event_registrations` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EventRegistrationStatus" AS ENUM ('active', 'pending', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "ClaimSeatErrorStatus" AS ENUM ('open', 'resolved');

-- AlterTable
ALTER TABLE "event_registrations" ALTER COLUMN "claim_seat_value" DROP NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "EventRegistrationStatus" DEFAULT 'active';

-- CreateTable
CREATE TABLE "claim_seat_errors" (
    "id" SERIAL NOT NULL,
    "event_id" UUID,
    "customer_id" UUID,
    "tried_value" TEXT,
    "error_message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claim_seat_errors_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "claim_seat_errors" ADD CONSTRAINT "claim_seat_errors_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim_seat_errors" ADD CONSTRAINT "claim_seat_errors_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
