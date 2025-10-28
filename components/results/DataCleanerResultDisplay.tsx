import React, { useMemo } from 'react';
import { DataCleanerResult } from '../../types';
import { SparklesIcon } from '../Icons';

interface DataCleanerResultDisplayProps {
  data: DataCleanerResult;
  onApply: (cleanedData: Record<string, any>[]) => void;
}

export const DataCleanerResultDisplay: React.FC<DataCleanerResultDisplayProps> = ({ data, onApply }) => {
  const { cleanedData = [], cleaningSummary = [] } = data;

  const { headers, rows } = useMemo(() => {
    if (cleanedData.length === 0) return { headers: [], rows: [] };
    const headers = Object.keys(cleanedData[0]);
    const rows = cleanedData.map(row => headers.map(header => row[header]));
    return { headers, rows };
  }, [cleanedData]);

  const hasCleanedData = cleanedData.length > 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-secondary mb-3">Cleaning Summary</h3>
          {cleaningSummary.length > 0 ? (
            <ul className="space-y-2 list-disc list-inside text-on-surface-variant">
              {cleaningSummary.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          ) : (
            <p className="text-on-surface-variant">No specific cleaning actions were reported by the AI.</p>
          )}
        </div>
        <div className="md:col-span-2 flex flex-col">
            <button
                onClick={() => onApply(cleanedData)}
                disabled={!hasCleanedData}
                className="w-full bg-primary hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center shadow-lg mb-4"
                >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Apply & Use Cleaned Data
            </button>
            <p className="text-xs text-on-surface-variant text-center">
                This will replace the current dataset with this cleaned version for all future analyses in this session.
            </p>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-on-surface mb-4">Cleaned Data Preview</h3>
        {hasCleanedData ? (
          <div className="max-h-96 overflow-auto border border-slate-700 rounded-lg">
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
                        {cell === null ? <span className="italic text-gray-500">NULL</span> : String(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
            <div className="flex items-center justify-center h-48 bg-slate-800 rounded-lg">
                <p className="text-on-surface-variant">No data to display.</p>
            </div>
        )}
      </div>
    </div>
  );
};