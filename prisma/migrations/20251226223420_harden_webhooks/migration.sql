-- CreateEnum
CREATE TYPE "WebhookProvider" AS ENUM ('CCBILL', 'STRIPE');

-- CreateEnum
CREATE TYPE "WebhookProcessStatus" AS ENUM ('RECEIVED', 'VERIFIED', 'REJECTED', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" "WebhookProvider" NOT NULL,
    "externalId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "transactionId" TEXT,
    "rawBody" TEXT,
    "payloadJson" JSONB,
    "status" "WebhookProcessStatus" NOT NULL DEFAULT 'RECEIVED',
    "error" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillingAuditLog" (
    "id" TEXT NOT NULL,
    "provider" "WebhookProvider" NOT NULL,
    "action" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "userEmail" TEXT,
    "creatorEmail" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillingAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebhookEvent_provider_receivedAt_idx" ON "WebhookEvent"("provider", "receivedAt");

-- CreateIndex
CREATE INDEX "WebhookEvent_subscriptionId_idx" ON "WebhookEvent"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "WebhookEvent_provider_externalId_key" ON "WebhookEvent"("provider", "externalId");

-- CreateIndex
CREATE INDEX "BillingAuditLog_provider_createdAt_idx" ON "BillingAuditLog"("provider", "createdAt");

-- CreateIndex
CREATE INDEX "BillingAuditLog_subscriptionId_idx" ON "BillingAuditLog"("subscriptionId");
