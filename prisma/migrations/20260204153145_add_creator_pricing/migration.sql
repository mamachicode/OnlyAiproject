/*
  Warnings:

  - You are about to drop the column `createdAt` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `WebhookEvent` table. All the data in the column will be lost.
  - You are about to drop the `BillingSubscription` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[processor,eventId]` on the table `WebhookEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `WebhookEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventType` to the `WebhookEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `processor` to the `WebhookEvent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentProcessor" AS ENUM ('STRIPE', 'CCBILL');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "BillingSubscription" DROP CONSTRAINT "BillingSubscription_userId_fkey";

-- DropForeignKey
ALTER TABLE "WebhookEvent" DROP CONSTRAINT "WebhookEvent_userId_fkey";

-- AlterTable
ALTER TABLE "WebhookEvent" DROP COLUMN "createdAt",
DROP COLUMN "type",
ADD COLUMN     "error" TEXT,
ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "eventType" TEXT NOT NULL,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processor" "PaymentProcessor" NOT NULL,
ADD COLUMN     "rawBody" TEXT,
ADD COLUMN     "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'RECEIVED',
ALTER COLUMN "payload" DROP NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- DropTable
DROP TABLE "BillingSubscription";

-- CreateTable
CREATE TABLE "Creator" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "displayName" TEXT,
    "classification" TEXT NOT NULL DEFAULT 'SFW',
    "platformFeeBps" INTEGER NOT NULL DEFAULT 2000,
    "priceCents" INTEGER NOT NULL DEFAULT 1000,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "billingPeriodDays" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "processor" "PaymentProcessor" NOT NULL,
    "externalId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Creator_userId_key" ON "Creator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Creator_handle_key" ON "Creator"("handle");

-- CreateIndex
CREATE INDEX "Subscription_userId_processor_status_idx" ON "Subscription"("userId", "processor", "status");

-- CreateIndex
CREATE INDEX "Subscription_creatorId_processor_status_idx" ON "Subscription"("creatorId", "processor", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_creatorId_processor_key" ON "Subscription"("userId", "creatorId", "processor");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_processor_externalId_key" ON "Subscription"("processor", "externalId");

-- CreateIndex
CREATE INDEX "WebhookEvent_processor_receivedAt_idx" ON "WebhookEvent"("processor", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_processor_eventId_key" ON "WebhookEvent"("processor", "eventId");

-- AddForeignKey
ALTER TABLE "Creator" ADD CONSTRAINT "Creator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
