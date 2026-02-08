-- AlterTable
ALTER TABLE "events" ADD COLUMN     "success_description" TEXT,
ADD COLUMN     "success_greeting" TEXT DEFAULT 'Registrasi Berhasil!',
ADD COLUMN     "success_primary_btn_text" TEXT DEFAULT 'Kembali ke Beranda',
ADD COLUMN     "success_primary_btn_url" TEXT DEFAULT '/';
