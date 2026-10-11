-- AlterTable
ALTER TABLE "NftToken" ADD COLUMN     "collectionId" INTEGER,
ADD COLUMN     "copies" INTEGER,
ADD COLUMN     "holders" TEXT[],
ADD COLUMN     "illustrationUrl" TEXT,
ADD COLUMN     "royalties" TEXT,
ADD COLUMN     "saleHistory" TEXT,
ALTER COLUMN "visible" DROP NOT NULL,
ALTER COLUMN "visible" DROP DEFAULT;

-- CreateTable
CREATE TABLE "NftCollection" (
    "id" SERIAL NOT NULL,
    "network" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NftCollection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NftCollection_network_contractId_idx" ON "NftCollection"("network", "contractId");

-- CreateIndex
CREATE UNIQUE INDEX "NftCollection_network_contractId_name_key" ON "NftCollection"("network", "contractId", "name");

-- CreateIndex
CREATE INDEX "NftToken_collectionId_idx" ON "NftToken"("collectionId");

-- AddForeignKey
ALTER TABLE "NftToken" ADD CONSTRAINT "NftToken_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "NftCollection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
