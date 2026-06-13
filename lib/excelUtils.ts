import * as XLSX from 'xlsx';
import type { Website } from '@prisma/client';

/**
 * Reusable utility to export website data to Excel (.xlsx)
 * @param data Array of website objects (from Prisma or API)
 * @param filename Name of the exported file (defaults to websites-directory.xlsx)
 */
export function exportWebsitesToExcel(data: Website[], filename: string = 'websites-directory.xlsx') {
  // Map internal data structure to the specifically requested display columns
  const worksheetData = data.map((site) => ({
    'Website Name': site.name,
    'URL': site.url,
    'Domain Authority': site.domainAuthority,
    'DA Category': site.daCategory,
    'Spam Score': site.spamScore,
    'Free Listing': site.freeListing ? 'Yes' : 'No',
    'Industry': site.industry,
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Websites');

  XLSX.writeFile(workbook, filename);
}