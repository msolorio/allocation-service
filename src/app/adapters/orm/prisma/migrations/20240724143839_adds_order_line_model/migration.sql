-- CreateTable
CREATE TABLE "OrderLine" (
    "orderRef" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,

    CONSTRAINT "OrderLine_pkey" PRIMARY KEY ("orderRef","sku")
);
