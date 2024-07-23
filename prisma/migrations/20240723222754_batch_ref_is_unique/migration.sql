/*
  Warnings:

  - A unique constraint covering the columns `[ref]` on the table `Batch` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Batch_ref_key" ON "Batch"("ref");
