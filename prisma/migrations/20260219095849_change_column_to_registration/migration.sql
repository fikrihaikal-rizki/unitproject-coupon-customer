/*
  Warnings:

  - You are about to drop the column `blacklisted_until` on the `customers` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "EventRegistrationStatus" ADD VALUE 'blacklisted';

-- AlterTable
ALTER TABLE "customers" DROP COLUMN "blacklisted_until";

-- AlterTable
ALTER TABLE "event_registrations" ADD COLUMN     "blacklisted_until" TIMESTAMPTZ;
