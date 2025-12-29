/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `error` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the column `eventType` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the column `externalId` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the column `payloadJson` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the column `processedAt` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the column `rawBody` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the column `receivedAt` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the `BillingAuditLog` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `authorId` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payload` to the `WebhookEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `WebhookEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `WebhookEvent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_creatorId_fkey";

-- DropIndex
DROP INDEX "Post_creatorId_idx";

-- DropIndex
DROP INDEX "WebhookEvent_provider_externalId_key";

-- DropIndex
DROP INDEX "WebhookEvent_provider_receivedAt_idx";

-- DropIndex
DROP INDEX "WebhookEvent_subscriptionId_idx";

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "createdAt",
DROP COLUMN "creatorId",
DROP COLUMN "updatedAt",
ADD COLUMN     "authorId" TEXT NOT NULL,
ADD COLUMN     "imageUrl" TEXT,
ALTER COLUMN "content" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "sfwPrice" DROP DEFAULT,
ALTER COLUMN "nsfwPrice" DROP DEFAULT;

-- AlterTable
ALTER TABLE "WebhookEvent" DROP COLUMN "error",
DROP COLUMN "eventType",
DROP COLUMN "externalId",
DROP COLUMN "payloadJson",
DROP COLUMN "processedAt",
DROP COLUMN "provider",
DROP COLUMN "rawBody",
DROP COLUMN "receivedAt",
DROP COLUMN "status",
DROP COLUMN "subscriptionId",
DROP COLUMN "transactionId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "payload" JSONB NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "BillingAuditLog";

-- DropEnum
DROP TYPE "WebhookProcessStatus";

-- DropEnum
DROP TYPE "WebhookProvider";

-- CreateTable
CREATE TABLE "BillingSubscription" (
    "id" TEXT NOT NULL,
    "stripeSubId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BillingSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingSubscription_stripeSubId_key" ON "BillingSubscription"("stripeSubId");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingSubscription" ADD CONSTRAINT "BillingSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
