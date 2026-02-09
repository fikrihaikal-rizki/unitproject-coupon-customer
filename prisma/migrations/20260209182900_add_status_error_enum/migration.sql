/*
  Warnings:

  - The `status` column on the `claim_seat_errors` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "claim_seat_errors" DROP COLUMN "status",
ADD COLUMN     "status" "ClaimSeatErrorStatus" DEFAULT 'open';
