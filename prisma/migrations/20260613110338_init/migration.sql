-- CreateEnum
CREATE TYPE "public"."DaCategory" AS ENUM ('Low', 'Average', 'Excellent');

-- CreateTable
CREATE TABLE "public"."Website" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domainAuthority" INTEGER NOT NULL DEFAULT 0,
    "spamScore" INTEGER NOT NULL DEFAULT 0,
    "freeListing" BOOLEAN NOT NULL DEFAULT false,
    "industry" TEXT NOT NULL,
    "daCategory" "public"."DaCategory" NOT NULL DEFAULT 'Low',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SearchHistory" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Website_url_key" ON "public"."Website"("url");

-- CreateIndex
CREATE INDEX "Website_industry_idx" ON "public"."Website"("industry");

-- CreateIndex
CREATE INDEX "Website_daCategory_idx" ON "public"."Website"("daCategory");

-- CreateIndex
CREATE INDEX "SearchHistory_keyword_idx" ON "public"."SearchHistory"("keyword");
