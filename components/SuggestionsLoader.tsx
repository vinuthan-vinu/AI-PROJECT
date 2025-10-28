import React from 'react';
import { LightbulbIcon } from './Icons';

export const SuggestionsLoader: React.FC = () => {
  return (
    <div className="bg-surface rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-on-surface mb-4 flex items-center">
        <LightbulbIcon className="w-6 h-6 mr-3 text-secondary animate-pulse" />
        Generating AI-Powered Suggestions...
      </h3>
      <p className="text-on-surface-variant">
        Our AI is analyzing your dataset to find interesting prediction opportunities. This should only take a moment.
      </p>
      <div className="mt-4 space-y-3">
        <div className="h-8 bg-slate-700 rounded w-3/4 animate-pulse"></div>
        <div className="h-4 bg-slate-700 rounded w-full animate-pulse"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6 animate-pulse"></div>
      </div>
    </div>
  );
};
