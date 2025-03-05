/*
  Warnings:

  - You are about to drop the column `timestamp` on the `Invoices` table. All the data in the column will be lost.
  - Added the required column `orderSummary` to the `Invoices` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoices" DROP COLUMN "timestamp",
ADD COLUMN     "orderSummary" JSONB NOT NULL;
