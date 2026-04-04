/*
  Warnings:

  - You are about to drop the column `price` on the `BillingSubscription` table. All the data in the column will be lost.
  - Made the column `subscriptionId` on table `BillingSubscription` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BillingSubscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subscriptionId" TEXT NOT NULL,
    "subscriberUsername" TEXT NOT NULL,
    "creatorUsername" TEXT NOT NULL,
    "siteSection" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_BillingSubscription" ("createdAt", "creatorUsername", "id", "siteSection", "status", "subscriberUsername", "subscriptionId", "updatedAt") SELECT "createdAt", "creatorUsername", "id", "siteSection", "status", "subscriberUsername", "subscriptionId", "updatedAt" FROM "BillingSubscription";
DROP TABLE "BillingSubscription";
ALTER TABLE "new_BillingSubscription" RENAME TO "BillingSubscription";
CREATE UNIQUE INDEX "BillingSubscription_subscriptionId_key" ON "BillingSubscription"("subscriptionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
