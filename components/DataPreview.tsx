
import React, { useMemo } from 'react';

interface DataPreviewProps {
  csvData: string;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ csvData }) => {
  const { headers, rows } = useMemo(() => {
    if (!csvData) return { headers: [], rows: [] };
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const dataRows = lines.slice(1, 101).map(line => 
      line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
    );
    const filteredRows = dataRows.filter(row => row.length > 1 || (row.length === 1 && row[0] !== ''));
    return { headers, rows: filteredRows };
  }, [csvData]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-on-surface mb-4">Data Preview (First 100 Rows)</h3>
      <div className="max-h-80 overflow-auto border border-slate-700 rounded-lg">
        <table className="min-w-full text-sm text-left text-on-surface-variant">
          <thead className="text-xs text-on-surface uppercase bg-slate-700 sticky top-0 z-10">
            <tr>
              {headers.map((header, index) => (
                <th key={index} scope="col" className="py-2 px-4 whitespace-nowrap font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-800">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="py-2 px-4 whitespace-nowrap">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
