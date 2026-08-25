/**
 * Smart Gym Enterprise - Export Engine
 * Utilities to generate CSV, Excel-compatible formats, and formatted Print/PDF reports
 */

export interface SummaryCardItem {
  label: string;
  value: string | number;
  color?: string;
}

export interface PrintReportOptions {
  title: string;
  subtitle?: string;
  branchName?: string;
  generatedBy?: string;
  dateRange?: string;
  summaryStats?: SummaryCardItem[];
  headers: string[];
  rows: (string | number | undefined | null)[][];
  notes?: string;
}

/**
 * Exports data to CSV file with UTF-8 BOM so Microsoft Excel renders accented/special characters cleanly.
 */
export const exportToCSV = (
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][]
) => {
  const sanitizeCell = (cell: string | number | undefined | null): string => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return '"' + str + '"';
  };

  const csvRows: string[] = [];
  
  // Header row
  csvRows.push(headers.map(sanitizeCell).join(','));

  // Data rows
  rows.forEach((row) => {
    csvRows.push(row.map(sanitizeCell).join(','));
  });

  const csvContent = '\uFEFF' + csvRows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanFileName = filename.endsWith('.csv') ? filename : filename + '.csv';
  link.setAttribute('download', cleanFileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports data formatted for Excel download (.csv with Excel identifier).
 */
export const exportToExcel = (
  filename: string,
  headers: string[],
  rows: (string | number | undefined | null)[][]
) => {
  const cleanFileName = filename.endsWith('.csv') ? filename : filename + '_excel.csv';
  exportToCSV(cleanFileName, headers, rows);
};

/**
 * Formats and opens a dedicated printable/PDF window with enterprise branding, stats, and signature line.
 */
export const exportToPrintPDF = (options: PrintReportOptions) => {
  const printWindow = window.open('', '_blank', 'width=1100,height=850');
  if (!printWindow) {
    alert('Please allow popups to open the printable PDF document.');
    return;
  }

  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const summaryHtml = options.summaryStats && options.summaryStats.length > 0
    ? '<div style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">' +
      options.summaryStats
        .map(
          (stat) =>
            '<div style="flex: 1; min-width: 150px; padding: 12px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">' +
            '<div style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px;">' + stat.label + '</div>' +
            '<div style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 4px;">' + stat.value + '</div>' +
            '</div>'
        )
        .join('') +
      '</div>'
    : '';

  const headersHtml = options.headers
    .map(
      (h) =>
        '<th style="padding: 10px 12px; background: #0f172a; color: #ffffff; font-size: 11px; text-transform: uppercase; font-weight: 700; text-align: left; border: 1px solid #0f172a;">' +
        h +
        '</th>'
    )
    .join('');

  const rowsHtml = options.rows
    .map(
      (row, idx) =>
        '<tr style="background: ' + (idx % 2 === 0 ? '#ffffff' : '#f8fafc') + ';">' +
        row
          .map(
            (cell) =>
              '<td style="padding: 9px 12px; font-size: 12px; color: #334155; border: 1px solid #e2e8f0;">' +
              (cell !== null && cell !== undefined ? cell : '—') +
              '</td>'
          )
          .join('') +
        '</tr>'
    )
    .join('');

  const html = '<!DOCTYPE html><html><head><title>' + options.title + ' - Smart Gym Enterprise</title><meta charset="utf-8" /><style>@page { size: A4 landscape; margin: 15mm; } body { font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; color: #0f172a; margin: 0; padding: 24px; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; } table { width: 100%; border-collapse: collapse; margin-top: 16px; } @media print { .no-print { display: none !important; } body { padding: 0; } }</style></head><body><div class="no-print" style="display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #ffffff; padding: 12px 20px; border-radius: 8px; margin-bottom: 24px;"><div><strong>Smart Gym Enterprise Report Viewer</strong><span style="font-size: 12px; color: #94a3b8; margin-left: 10px;">Ready for printing or PDF export</span></div><div><button onclick="window.print()" style="background: #27D980; color: #000000; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 800; cursor: pointer; font-size: 12px; margin-right: 8px;">🖨️ Print / Save as PDF</button><button onclick="window.close()" style="background: #334155; color: #ffffff; border: none; padding: 8px 14px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px;">Close</button></div></div><div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 20px;"><div><div style="font-size: 22px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: -0.5px;">SMART GYM ENTERPRISE</div><div style="font-size: 15px; font-weight: 700; color: #3b82f6; margin-top: 2px;">' + options.title + '</div>' + (options.subtitle ? '<div style="font-size: 12px; color: #64748b; margin-top: 2px;">' + options.subtitle + '</div>' : '') + '</div><div style="text-align: right; font-size: 11px; color: #475569; line-height: 1.5;"><div><strong>Branch:</strong> ' + (options.branchName || 'All Branches') + '</div><div><strong>Generated:</strong> ' + formattedDate + ' at ' + formattedTime + '</div><div><strong>Generated By:</strong> ' + (options.generatedBy || 'Master Administrator') + '</div>' + (options.dateRange ? '<div><strong>Period:</strong> ' + options.dateRange + '</div>' : '') + '</div></div>' + summaryHtml + '<table><thead><tr>' + headersHtml + '</tr></thead><tbody>' + rowsHtml + '</tbody></table><div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px;"><div><div>Smart Gym Enterprise ERP v2026.1 • Confidential Business Record</div><div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">This document was securely generated directly from Cloud Firestore.</div></div><div style="text-align: right; min-width: 200px;"><div style="border-bottom: 1px solid #94a3b8; width: 160px; margin-bottom: 4px; display: inline-block;"></div><div>Authorized Signatory / Branch Head</div></div></div><script>window.addEventListener("load", () => { setTimeout(() => { window.print(); }, 300); });</script></body></html>';

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};
