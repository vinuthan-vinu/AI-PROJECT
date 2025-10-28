import React from 'react';
import { InsightSummaryResult, Insight } from '../types';
import { ShieldWarningIcon } from './Icons';

interface InsightsSummaryDisplayProps {
  insights: InsightSummaryResult;
  onClear: () => void;
}

const ConfidenceBadge: React.FC<{ level: Insight['confidence'] }> = ({ level }) => {
  const levelStyles = {
    High: 'bg-green-500 text-green-100',
    Medium: 'bg-yellow-500 text-yellow-100',
    Low: 'bg-blue-500 text-blue-100',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${levelStyles[level]}`}>
      {level} Confidence
    </span>
  );
};

export const InsightsSummaryDisplay: React.FC<InsightsSummaryDisplayProps> = ({ insights, onClear }) => {
  return (
    <div className="bg-surface rounded-lg shadow-lg p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-on-surface">Automated Insights Summary</h2>
        <button onClick={onClear} className="text-sm text-on-surface-variant hover:text-on-surface">&times; Close</button>
      </div>

      <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg flex items-start mb-6">
        <ShieldWarningIcon className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-lg">Important Disclaimer</h3>
          <p className="text-sm">These insights are AI-generated predictions based on a sample of your data. They are probabilistic and should be interpreted as potential areas for further investigation, not as definitive facts. Always validate critical findings through rigorous analysis.</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-secondary">{insight.title}</h3>
              <ConfidenceBadge level={insight.confidence} />
            </div>
            <p className="text-on-surface-variant">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
