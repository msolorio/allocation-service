/*
  Warnings:

  - The primary key for the `OrderLine` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[orderref,sku]` on the table `OrderLine` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OrderLine" DROP CONSTRAINT "OrderLine_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "OrderLine_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "OrderLine_orderref_sku_key" ON "OrderLine"("orderref", "sku");
