-- CreateEnum
CREATE TYPE "AdminRoles" AS ENUM ('admin', 'operator');

-- AlterTable
ALTER TABLE "administrators" ADD COLUMN     "role" "AdminRoles" DEFAULT 'admin';
