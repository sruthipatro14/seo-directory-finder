import { prisma } from "@/lib/prisma";
import { Prisma, Website } from "@prisma/client";

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
