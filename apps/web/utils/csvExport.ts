/**
 * Utility to export JSON data to CSV and trigger download
 */
export const exportToCsv = (filename: string, rows: object[]) => {
    if (!rows || !rows.length) return;

    const separator = ',';
    const keys = Object.keys(rows[0]);

    const csvContent = [
        keys.join(separator), // Header
        ...rows.map(row => {
            return keys.map(key => {
                const value = (row as Record<string, any>)[key];
                const cell = value === null || value === undefined ? '' : value;
                const cellString = String(cell).replace(/"/g, '""');
                if (cellString.includes(separator) || cellString.includes('\n')) {
                    return `"${cellString}"`;
                }
                return cellString;
            }).join(separator);
        })
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
