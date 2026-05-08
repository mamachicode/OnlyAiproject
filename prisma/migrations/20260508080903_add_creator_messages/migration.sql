CREATE TABLE IF NOT EXISTS "CreatorMessage" (
  "id" TEXT NOT NULL,
  "creatorId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CreatorMessage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CreatorMessage_creatorId_fkey"
    FOREIGN KEY ("creatorId") REFERENCES "Creator"("id")
    ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "CreatorMessage_creatorId_createdAt_idx"
ON "CreatorMessage"("creatorId", "createdAt");
