/*
  Warnings:

  - The primary key for the `Subscription` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `active` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Subscription` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Subscription` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to drop the column `subscriptionPrice` on the `User` table. All the data in the column will be lost.
  - Added the required column `creatorEmail` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siteSection` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subscriberEmail` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subscriberEmail" TEXT NOT NULL,
    "creatorEmail" TEXT NOT NULL,
    "siteSection" TEXT NOT NULL,
    "ccbillSubscriptionId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Subscription" ("createdAt", "id") SELECT "createdAt", "id" FROM "Subscription";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
CREATE UNIQUE INDEX "Subscription_ccbillSubscriptionId_key" ON "Subscription"("ccbillSubscriptionId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "sfwPrice" INTEGER DEFAULT 5,
    "nsfwPrice" INTEGER DEFAULT 10,
    "isNsfw" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_User" ("email", "id", "isNsfw", "password", "username") SELECT "email", "id", "isNsfw", "password", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
