-- CreateTable
CREATE TABLE "Tourist" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "googleId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tourist_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "TouristRequest" ADD COLUMN "touristId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "userType" TEXT NOT NULL DEFAULT 'tourist',
ADD COLUMN "touristId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Tourist_email_key" ON "Tourist"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tourist_googleId_key" ON "Tourist"("googleId");

-- CreateIndex
CREATE INDEX "Tourist_email_idx" ON "Tourist"("email");

-- CreateIndex
CREATE INDEX "Tourist_googleId_idx" ON "Tourist"("googleId");

-- CreateIndex
CREATE INDEX "TouristRequest_touristId_idx" ON "TouristRequest"("touristId");

-- CreateIndex
CREATE INDEX "User_touristId_idx" ON "User"("touristId");

-- AddForeignKey
ALTER TABLE "TouristRequest" ADD CONSTRAINT "TouristRequest_touristId_fkey" FOREIGN KEY ("touristId") REFERENCES "Tourist"("id") ON DELETE SET NULL ON UPDATE CASCADE;
