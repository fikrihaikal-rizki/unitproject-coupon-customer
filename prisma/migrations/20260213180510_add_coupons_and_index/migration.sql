-- AlterTable
ALTER TABLE "administrators" ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ,
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ;

-- CreateTable
CREATE TABLE "event_coupons" (
    "id" SERIAL NOT NULL,
    "event_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "allow_generate_from" TIMESTAMPTZ NOT NULL,
    "allow_generate_until" TIMESTAMPTZ NOT NULL,
    "redeem_from" TIMESTAMPTZ NOT NULL,
    "redeem_until" TIMESTAMPTZ NOT NULL,
    "max_quota" INTEGER,
    "total_generated" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "event_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_coupons" (
    "id" SERIAL NOT NULL,
    "registration_id" INTEGER NOT NULL,
    "event_coupon_id" INTEGER NOT NULL,
    "qr_data" TEXT NOT NULL,
    "is_redeemed" BOOLEAN NOT NULL DEFAULT false,
    "generated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemed_at" TIMESTAMPTZ,
    "scanned_by_id" INTEGER,

    CONSTRAINT "customer_coupons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_coupons_slug_key" ON "event_coupons"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "customer_coupons_qr_data_key" ON "customer_coupons"("qr_data");

-- CreateIndex
CREATE INDEX "customer_coupons_event_coupon_id_is_redeemed_idx" ON "customer_coupons"("event_coupon_id", "is_redeemed");

-- CreateIndex
CREATE INDEX "customer_coupons_qr_data_idx" ON "customer_coupons"("qr_data");

-- CreateIndex
CREATE INDEX "claim_seat_errors_event_id_created_at_idx" ON "claim_seat_errors"("event_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "customers_phone_number_idx" ON "customers"("phone_number");

-- CreateIndex
CREATE INDEX "event_registrations_event_id_status_idx" ON "event_registrations"("event_id", "status");

-- CreateIndex
CREATE INDEX "event_registrations_claim_seat_value_idx" ON "event_registrations"("claim_seat_value");

-- AddForeignKey
ALTER TABLE "event_coupons" ADD CONSTRAINT "event_coupons_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_coupons" ADD CONSTRAINT "customer_coupons_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "event_registrations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_coupons" ADD CONSTRAINT "customer_coupons_event_coupon_id_fkey" FOREIGN KEY ("event_coupon_id") REFERENCES "event_coupons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_coupons" ADD CONSTRAINT "customer_coupons_scanned_by_id_fkey" FOREIGN KEY ("scanned_by_id") REFERENCES "administrators"("id") ON DELETE SET NULL ON UPDATE CASCADE;
