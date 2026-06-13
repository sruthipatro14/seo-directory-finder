'use client';

import { exportWebsitesToExcel } from '@/lib/excelUtils';
import type { Website } from '@prisma/client';

interface ExportButtonProps {
  data: Website[];
  filename?: string;
}

export default function ExportButton({ data, filename }: ExportButtonProps) {
  return (
    <button
      onClick={() => exportWebsitesToExcel(data, filename)}
      className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-80 transition-opacity"
    >
      Export to Excel
    </button>
  );
}