-- CreateTable
CREATE TABLE "BillingSubscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subscriberUsername" TEXT NOT NULL,
    "creatorUsername" TEXT NOT NULL,
    "siteSection" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "BillingSubscription_subscriberUsername_creatorUsername_siteSection_key" ON "BillingSubscription"("subscriberUsername", "creatorUsername", "siteSection");
