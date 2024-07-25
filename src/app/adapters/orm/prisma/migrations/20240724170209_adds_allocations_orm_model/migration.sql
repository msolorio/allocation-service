-- CreateTable
CREATE TABLE "Allocation" (
    "id" SERIAL NOT NULL,
    "batchid" INTEGER NOT NULL,
    "orderlineid" INTEGER NOT NULL,

    CONSTRAINT "Allocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Allocation_orderlineid_key" ON "Allocation"("orderlineid");

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_batchid_fkey" FOREIGN KEY ("batchid") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_orderlineid_fkey" FOREIGN KEY ("orderlineid") REFERENCES "OrderLine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
