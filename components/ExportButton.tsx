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
      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors duration-200 shadow-sm"
    >
      Export to Excel
    </button>
  );
}