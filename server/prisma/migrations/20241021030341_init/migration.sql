/*
  Warnings:

  - Added the required column `setType` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SetType" AS ENUM ('ABC', 'A', 'C');

-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "setType" "SetType" NOT NULL;
