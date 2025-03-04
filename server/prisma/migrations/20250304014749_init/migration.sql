-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "refreshTokens" JSONB DEFAULT '[]';
