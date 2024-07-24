/*
  Warnings:

  - The primary key for the `OrderLine` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `orderRef` on the `OrderLine` table. All the data in the column will be lost.
  - Added the required column `orderref` to the `OrderLine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderLine" DROP CONSTRAINT "OrderLine_pkey",
DROP COLUMN "orderRef",
ADD COLUMN     "orderref" TEXT NOT NULL,
ADD CONSTRAINT "OrderLine_pkey" PRIMARY KEY ("orderref", "sku");
