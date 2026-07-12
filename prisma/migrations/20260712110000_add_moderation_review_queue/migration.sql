-- CreateEnum
CREATE TYPE "ModerationReviewStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REMOVED'
);

-- CreateTable
CREATE TABLE "ModerationReview" (
    "id" TEXT NOT NULL,
    "postId" TEXT,
    "pendingKey" TEXT,
    "creatorUserId" TEXT NOT NULL,
    "creatorHandle" TEXT,
    "postTitle" TEXT,
    "source" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ModerationReviewStatus" NOT NULL DEFAULT 'PENDING',
    "mediaPublicIds" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedByEmail" TEXT,

    CONSTRAINT "ModerationReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModerationReview_pendingKey_key"
ON "ModerationReview"("pendingKey");

-- CreateIndex
CREATE INDEX "ModerationReview_status_createdAt_idx"
ON "ModerationReview"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ModerationReview_postId_status_idx"
ON "ModerationReview"("postId", "status");

-- CreateIndex
CREATE INDEX "ModerationReview_creatorUserId_createdAt_idx"
ON "ModerationReview"("creatorUserId", "createdAt");

-- AddForeignKey
ALTER TABLE "ModerationReview"
ADD CONSTRAINT "ModerationReview_postId_fkey"
FOREIGN KEY ("postId") REFERENCES "Post"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
