import React from 'react';
import { PredictionSuggestion } from '../types';
import { LightbulbIcon } from './Icons';

interface PredictionSuggestionsProps {
  suggestions: PredictionSuggestion[];
  onApplySuggestion: (suggestion: PredictionSuggestion) => void;
}

export const PredictionSuggestions: React.FC<PredictionSuggestionsProps> = ({ suggestions, onApplySuggestion }) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-on-surface mb-4 flex items-center">
        <LightbulbIcon className="w-6 h-6 mr-3 text-secondary" />
        AI-Powered Suggestions
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-slate-800 p-4 rounded-lg flex flex-col justify-between border border-slate-700 hover:border-secondary transition-colors">
            <div>
              <h4 className="font-bold text-on-surface">{suggestion.title}</h4>
              <p className="text-sm text-on-surface-variant mt-2 mb-4">{suggestion.justification}</p>
            </div>
            <button
              onClick={() => onApplySuggestion(suggestion)}
              className="mt-auto w-full bg-primary/80 hover:bg-primary text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Configure Analysis
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
