/*
  Warnings:

  - You are about to drop the column `question_text` on the `claim_seat_configs` table. All the data in the column will be lost.
  - You are about to drop the column `question_text` on the `questionnaire_questions` table. All the data in the column will be lost.
  - Added the required column `description` to the `claim_seat_configs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `questionnaire_questions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "claim_seat_configs" DROP COLUMN "question_text",
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "questionnaire_questions" DROP COLUMN "question_text",
ADD COLUMN     "description" TEXT NOT NULL;
