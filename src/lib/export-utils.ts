
'use client';

export function convertToCSV(data: any[], headers?: string[]): string {
  if (data.length === 0) {
    return '';
  }

  const columnHeaders = headers || Object.keys(data[0]);
  
  const escapeCSVField = (field: any): string => {
    if (field === null || field === undefined) {
      return '';
    }
    const stringField = String(field);
    // If the field contains a comma, double quote, or newline, wrap it in double quotes
    // and escape any existing double quotes by doubling them.
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`;
    }
    return stringField;
  };

  const headerRow = columnHeaders.map(escapeCSVField).join(',');
  
  const dataRows = data.map(row => {
    return columnHeaders.map(header => {
      // For nested objects like property.agent.name, access them directly if a flat structure is prepared
      // Or, if headers are like 'agent.name', split and reduce.
      // For simplicity here, assume flat data or specific mapping in the calling function.
      let value = row[header];
      if (header.includes('.')) {
        const parts = header.split('.');
        value = parts.reduce((obj, part) => (obj && obj[part] !== undefined) ? obj[part] : '', row);
      }
      return escapeCSVField(value);
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

export function downloadCSV(csvString: string, filename: string): void {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) { // feature detection
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
