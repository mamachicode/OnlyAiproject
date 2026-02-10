-- AlterTable
ALTER TABLE "PostMedia" ADD COLUMN     "blurUrl" TEXT,
ADD COLUMN     "publicId" TEXT;

-- CreateIndex
CREATE INDEX "PostMedia_publicId_idx" ON "PostMedia"("publicId");
