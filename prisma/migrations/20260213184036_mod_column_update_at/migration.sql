-- AlterTable
ALTER TABLE "administrators" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "claim_seat_configs" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "claim_seat_errors" ADD COLUMN     "updated_at" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "customers" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "event_coupons" ADD COLUMN     "created_at" TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "event_registrations" ADD COLUMN     "updated_at" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "updated_at" TIMESTAMPTZ;

-- AlterTable
ALTER TABLE "questionnaire_questions" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "registration_steps" ALTER COLUMN "updated_at" DROP DEFAULT;
