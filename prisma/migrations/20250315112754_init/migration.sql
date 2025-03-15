/*
  Warnings:

  - The `refreshTokens` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "refreshTokens",
ADD COLUMN     "refreshTokens" TEXT[] DEFAULT ARRAY[]::TEXT[];
