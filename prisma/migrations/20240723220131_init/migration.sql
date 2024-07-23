-- CreateTable
CREATE TABLE "Batch" (
    "id" SERIAL NOT NULL,
    "ref" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "eta" TIMESTAMP(3),

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);
