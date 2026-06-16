import "server-only";
import { prisma } from "@/lib/prisma";
import { Prisma, Website, DaCategory } from "@prisma/client";
import { normalizeUrl } from "./urlUtils";

// ─── Read ────────────────────────────────────────────────────────────────────

/**
 * Returns all websites ordered by createdAt descending.
 */
export async function getAllWebsites(): Promise<Website[]> {
  return prisma.website.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Returns a single website by id, or null if not found.
 */
export async function getWebsiteById(id: string): Promise<Website | null> {
  return prisma.website.findUnique({
    where: { id },
  });
}

/**
 * Filters websites by their classified industry.
 */
export async function getWebsitesByIndustry(
  industry: string
): Promise<Website[]> {
  return prisma.website.findMany({
    where: { industry, active: true },
    orderBy: { domainAuthority: "desc" },
  });
}

/**
 * Filters websites by their Domain Authority category.
 */
export async function getWebsitesByDACategory(
  daCategory: DaCategory
): Promise<Website[]> {
  return prisma.website.findMany({
    where: { daCategory, active: true },
    orderBy: { domainAuthority: "desc" },
  });
}

/**
 * Returns all websites that offer free listings.
 */
export async function getFreeListingSites(): Promise<Website[]> {
  return prisma.website.findMany({
    where: { freeListing: true, active: true },
    orderBy: { domainAuthority: "desc" },
  });
}

// ─── Write ───────────────────────────────────────────────────────────────────

/**
 * Creates a new website record and returns it.
 */
export async function createWebsite(
  data: Prisma.WebsiteCreateInput
): Promise<Website> {
  return prisma.website.create({ data });
}

/**
 * Saves a discovered website using an upsert strategy based on URL.
 */
export async function saveDiscoveredWebsite(
  data: Prisma.WebsiteCreateInput
): Promise<Website> {
  const normalizedUrl = normalizeUrl(data.url);
  return prisma.website.upsert({
    where: { url: normalizedUrl },
    update: {
      name: data.name,
      description: data.description,
      domainAuthority: data.domainAuthority,
      spamScore: data.spamScore,
      estimatedTraffic: data.estimatedTraffic,
      contactEmail: data.contactEmail,
      socialLinks: data.socialLinks,
      freeListing: data.freeListing,
      industry: data.industry,
      daCategory: data.daCategory,
      active: data.active,
      freeOrPaid: data.freeOrPaid,
      canSubmitListing: data.canSubmitListing,
      submissionUrl: data.submissionUrl,
      rankPosition: data.rankPosition,
      sourceProvider: data.sourceProvider,
    },
    create: { ...data, url: normalizedUrl },
  });
}

/**
 * Bulk saves multiple websites. Skips duplicates.
 */
export async function saveMultipleWebsites(
  websites: Prisma.WebsiteCreateInput[]
): Promise<Prisma.BatchPayload> {
  return prisma.website.createMany({
    data: websites,
    skipDuplicates: true,
  });
}

/**
 * Updates an existing website by id and returns the updated record.
 * Throws Prisma P2025 if the record does not exist.
 */
export async function updateWebsite(
  id: string,
  data: Prisma.WebsiteUpdateInput
): Promise<Website> {
  return prisma.website.update({
    where: { id },
    data,
  });
}

/**
 * Deletes a website by id and returns the deleted record.
 * Throws Prisma P2025 if the record does not exist.
 */
export async function deleteWebsite(id: string): Promise<Website> {
  return prisma.website.delete({
    where: { id },
  });
}

/**
 * Searches for websites based on a keyword across name, URL, and industry.
 * Returns only active websites, ordered by Domain Authority.
 */
export async function searchWebsites(keyword: string): Promise<Website[]> {
  const searchLower = keyword.toLowerCase();
  return prisma.website.findMany({
    where: {
      OR: [
        { name: { contains: searchLower } },
        { url: { contains: searchLower } },
        { industry: { contains: searchLower } },
      ],
      active: true, // Only show active websites
    },
    orderBy: { domainAuthority: "desc" }, // Order by DA for relevance
  });
}


/**
 * Aggregates statistics for the Admin Dashboard.
 */
export async function getAdminStats() {
  const [
    totalWebsites,
    totalFreeListing,
    avgMetrics,
    daDistribution,
    recentWebsites,
    industryGroups,
  ] = await Promise.all([
    prisma.website.count(),
    prisma.website.count({ where: { freeListing: true, active: true } }),
    prisma.website.aggregate({
      _avg: {
        domainAuthority: true,
        spamScore: true,
      },
    }),
    prisma.website.groupBy({
      by: ["daCategory"],
      _count: { _all: true },
    }),
    prisma.website.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
    prisma.website.groupBy({ by: ["industry"] }),
  ]);

  return {
    totalWebsites,
    totalIndustries: industryGroups.length,
    averageDA: Number((avgMetrics._avg.domainAuthority ?? 0).toFixed(1)),
    averageSpamScore: Number((avgMetrics._avg.spamScore ?? 0).toFixed(1)),
    freeListingSites: totalFreeListing,
    recentWebsites,
    daDistribution: daDistribution.map((d) => ({
      category: d.daCategory,
      count: d._count._all,
    })),
  };
}
