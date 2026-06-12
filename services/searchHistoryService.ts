import { prisma } from "@/lib/prisma";
import { SearchHistory } from "@prisma/client";

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
