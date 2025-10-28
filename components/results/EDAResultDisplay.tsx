import React from 'react';
import { EDAResult } from '../../types';

interface EDAResultDisplayProps {
  data: EDAResult;
}

const StatCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-800 rounded-lg p-4 shadow-md">
        <h3 className="text-lg font-semibold text-secondary mb-3">{title}</h3>
        {children}
    </div>
);

export const EDAResultDisplay: React.FC<EDAResultDisplayProps> = ({ data }) => {
  const hasSummaryStats = data.summaryStats && data.summaryStats.length > 0;
  const hasMissingValues = data.missingValues && data.missingValues.length > 0;
  const hasValueCounts = data.valueCounts && data.valueCounts.length > 0;
  const hasCorrelations = data.correlations && data.correlations.length > 0 && data.correlations[0]?.values?.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <StatCard title="Summary Statistics">
        {hasSummaryStats ? (
          <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-on-surface-variant">
                  <thead className="text-xs text-on-surface uppercase bg-slate-700">
                      <tr>
                          <th scope="col" className="py-2 px-4">Column</th>
                          <th scope="col" className="py-2 px-4">Mean</th>
                          <th scope="col" className="py-2 px-4">Std Dev</th>
                          <th scope="col" className="py-2 px-4">Min</th>
                          <th scope="col" className="py-2 px-4">25%</th>
                          <th scope="col" className="py-2 px-4">50%</th>
                          <th scope="col" className="py-2 px-4">75%</th>
                          <th scope="col" className="py-2 px-4">Max</th>
                      </tr>
                  </thead>
                  <tbody>
                      {data.summaryStats.map(stat => (
                          <tr key={stat.columnName} className="bg-slate-800 border-b border-slate-700">
                              <td className="py-2 px-4 font-medium">{stat.columnName}</td>
                              <td className="py-2 px-4">{stat.mean?.toFixed(2) ?? 'N/A'}</td>
                              <td className="py-2 px-4">{stat.std?.toFixed(2) ?? 'N/A'}</td>
                              <td className="py-2 px-4">{stat.min?.toFixed(2) ?? 'N/A'}</td>
                              <td className="py-2 px-4">{stat.p25?.toFixed(2) ?? 'N/A'}</td>
                              <td className="py-2 px-4">{stat.p50?.toFixed(2) ?? 'N/A'}</td>
                              <td className="py-2 px-4">{stat.p75?.toFixed(2) ?? 'N/A'}</td>
                              <td className="py-2 px-4">{stat.max?.toFixed(2) ?? 'N/A'}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
        ) : <p className="text-on-surface-variant">No summary statistics available.</p>}
      </StatCard>

      <StatCard title="Missing Values">
        {hasMissingValues ? (
          <ul className="space-y-2">
            {data.missingValues.map(({ columnName, count }) => (
              <li key={columnName} className="flex justify-between items-center bg-slate-700 p-2 rounded">
                <span className="font-mono text-on-surface">{columnName}</span>
                <span className="font-semibold text-secondary">{count}</span>
              </li>
            ))}
          </ul>
        ) : <p className="text-on-surface-variant">No missing values detected.</p>}
      </StatCard>

      <StatCard title="Value Counts (Categorical)">
        {hasValueCounts ? (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {data.valueCounts.map(({ columnName, counts }) => (
              <div key={columnName}>
                <h4 className="font-semibold text-on-surface mb-2">{columnName}</h4>
                <ul className="text-sm space-y-1">
                  {counts && counts.map(({ value, count }) => (
                    <li key={value} className="flex justify-between">
                      <span className="text-on-surface-variant truncate pr-4">{value}</span>
                      <span>{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : <p className="text-on-surface-variant">No categorical columns found.</p>}
      </StatCard>
      
      {hasCorrelations && (
        <StatCard title="Correlation Matrix">
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-on-surface-variant">
                    <thead className="text-xs text-on-surface uppercase bg-slate-700">
                        <tr>
                            <th className="py-2 px-4"></th>
                            {data.correlations[0].values.map(v => <th key={v.columnName} className="py-2 px-4">{v.columnName}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.correlations.map((row) => (
                            <tr key={row.columnName} className="bg-slate-800 border-b border-slate-700">
                                <td className="py-2 px-4 font-medium text-on-surface">{row.columnName}</td>
                                {row.values.map((cell) => <td key={`${row.columnName}-${cell.columnName}`} className="py-2 px-4">{cell.value.toFixed(2)}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </StatCard>
      )}

    </div>
  );
};