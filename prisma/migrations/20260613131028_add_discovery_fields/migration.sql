-- AlterTable
ALTER TABLE "public"."Website" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "estimatedTraffic" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "socialLinks" JSONB;
