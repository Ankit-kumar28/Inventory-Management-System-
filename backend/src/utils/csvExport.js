export function arrayToCsv(data, headers) {
  if (!data || data.length === 0) return '';
  const headerRow = headers.map(h => `"${h.label}"`).join(',');
  const rows = data.map(row => headers.map(h => {
    const val = h.accessor(row);
    if (val === null || val === undefined) return '""';
    return `"${String(val).replace(/"/g, '""')}"`;
  }).join(','));
  return [headerRow, ...rows].join('\n');
}
export function sendCsvResponse(res, data, filename) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(data);
}
