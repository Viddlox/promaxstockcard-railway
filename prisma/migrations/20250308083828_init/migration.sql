/*
  Warnings:

  - The `partUoM` column on the `Inventory` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `setType` on the `Orders` table. All the data in the column will be lost.
  - The `role` column on the `Users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'AGENT', 'WORKER');

-- AlterTable
ALTER TABLE "Inventory" ALTER COLUMN "partQuantity" SET DEFAULT 0,
DROP COLUMN "partUoM",
ADD COLUMN     "partUoM" TEXT NOT NULL DEFAULT 'UNIT';

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "setType",
ADD COLUMN     "agentName" TEXT NOT NULL DEFAULT 'Unknown';

-- AlterTable
ALTER TABLE "Products" ALTER COLUMN "quantity" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Users" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'WORKER';

-- DropEnum
DROP TYPE "SetType";

-- DropEnum
DROP TYPE "UoM";
