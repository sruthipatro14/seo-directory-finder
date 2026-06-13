import "server-only";
import { prisma } from "@/lib/prisma";
import { SearchHistory } from "@prisma/client";

/**
 * Statistics for a specific keyword.
 */
export interface KeywordStats {
  keyword: string;
  count: number;
}

/**
 * Saves a searched keyword to the database.
 * Silently ignores empty or whitespace-only strings.
 */
export async function saveSearch(
  keyword: string
): Promise<SearchHistory | null> {
  const trimmed = keyword.trim();
  if (!trimmed) return null;

  return prisma.searchHistory.create({
    data: { keyword: trimmed },
  });
}

/**
 * Analytics: Total number of searches performed.
 */
export async function getSearchCount(): Promise<number> {
  return prisma.searchHistory.count();
}

/**
 * Analytics: Top searched keywords with their frequencies across all time.
 */
export async function getMostSearchedKeywords(
  limit = 10
): Promise<KeywordStats[]> {
  const stats = await prisma.searchHistory.groupBy({
    by: ["keyword"],
    _count: {
      keyword: true,
    },
    orderBy: {
      _count: {
        keyword: "desc",
      },
    },
    take: limit,
  });

  return stats.map((item) => ({
    keyword: item.keyword,
    count: item._count.keyword,
  }));
}

/**
 * Analytics: Trending keywords based on frequency in the last X days.
 */
export async function getTrendingKeywords(
  days = 7,
  limit = 10
): Promise<KeywordStats[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const stats = await prisma.searchHistory.groupBy({
    by: ["keyword"],
    where: {
      createdAt: { gte: startDate },
    },
    _count: {
      keyword: true,
    },
    orderBy: {
      _count: {
        keyword: "desc",
      },
    },
    take: limit,
  });

  return stats.map((item) => ({
    keyword: item.keyword,
    count: item._count.keyword,
  }));
}

/**
 * Returns the most recent searches, newest first.
 * Defaults to the last 20 entries.
 */
export async function getRecentSearches(limit = 20): Promise<SearchHistory[]> {
  return prisma.searchHistory.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Deletes a single search history record by id.
 * Throws Prisma P2025 if the record does not exist.
 */
export async function deleteSearch(id: string): Promise<SearchHistory> {
  return prisma.searchHistory.delete({
    where: { id },
  });
}
