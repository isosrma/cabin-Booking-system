-- CreateTable
CREATE TABLE "Cabin" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "regularPrice" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "image" TEXT,

    CONSTRAINT "Cabin_pkey" PRIMARY KEY ("id")
);
