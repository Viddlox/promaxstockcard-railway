/*
  Warnings:

  - The values [AGENT,WORKER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `agentId` on the `Orders` table. All the data in the column will be lost.
  - You are about to drop the column `agentName` on the `Orders` table. All the data in the column will be lost.
  - Added the required column `salesAgentId` to the `Orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('OWNER', 'ADMIN', 'SALES', 'STORE');
ALTER TABLE "Users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "Users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "Users" ALTER COLUMN "role" SET DEFAULT 'STORE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_agentId_fkey";

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "agentId",
DROP COLUMN "agentName",
ADD COLUMN     "salesAgentId" TEXT NOT NULL,
ADD COLUMN     "salesAgentName" TEXT NOT NULL DEFAULT 'Unknown';

-- AlterTable
ALTER TABLE "Users" ALTER COLUMN "role" SET DEFAULT 'STORE';

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_salesAgentId_fkey" FOREIGN KEY ("salesAgentId") REFERENCES "Users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
