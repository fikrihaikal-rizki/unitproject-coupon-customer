/*
  Warnings:

  - You are about to drop the column `claim_seat_input_type` on the `claim_seat_configs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "claim_seat_configs" DROP COLUMN "claim_seat_input_type",
ADD COLUMN     "input_type" "ClaimSeatInputType";
