import * as XLSX from 'xlsx';
import type { Website } from '@prisma/client';
import { formatDateSafe } from '../services/dateUtils';

/**
 * Reusable utility to export website data to Excel (.xlsx)
 * @param data Array of website objects (from Prisma or API)
 * @param filename Name of the exported file (defaults to websites-directory.xlsx)
 */
export function exportWebsitesToExcel(data: Website[], filename: string = 'websites-directory.xlsx') {
  // Map internal data structure to the specifically requested display columns
  const worksheetData = data.map((site) => ({
    'Website Name': site.name,
    'Domain': new URL(site.url).hostname,
    'URL': site.url,
    'Description': site.description,
    'Domain Authority': site.domainAuthority,
    'DA Category': site.daCategory,
    'Spam Score': site.spamScore,
    'Traffic': site.estimatedTraffic,
    'Email': site.contactEmail,
    'Social Links': site.socialLinks ? JSON.stringify(site.socialLinks) : 'N/A',
    'Status': site.active ? 'Active' : 'Inactive',
    'Free Listing': site.freeListing ? 'Yes' : 'No',
    'Industry': site.industry,
    'Date Added': site.createdAt ? formatDateSafe(site.createdAt) : 'N/A'
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Websites');

  XLSX.writeFile(workbook, filename);
}

/**
 * Utility to export website data to CSV
 */
export function exportWebsitesToCSV(data: Website[], filename: string = 'websites-directory.csv') {
  const worksheetData = data.map((site) => ({
    'Website Name': site.name,
    'Domain': new URL(site.url).hostname,
    'URL': site.url,
    'Description': site.description,
    'Domain Authority': site.domainAuthority,
    'Spam Score': site.spamScore,
    'Traffic': site.estimatedTraffic,
    'Email': site.contactEmail,
    'Status': site.active ? 'Active' : 'Inactive',
    'Industry': site.industry,
    'Date Added': site.createdAt ? formatDateSafe(site.createdAt) : 'N/A'
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.click();
}