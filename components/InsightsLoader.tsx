import React from 'react';
import { WandIcon } from './Icons';

export const InsightsLoader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-surface rounded-lg p-8 text-center">
        <WandIcon className="w-12 h-12 text-primary mb-4 animate-pulse" />
        <h2 className="text-2xl font-bold text-on-surface mb-2">Generating Insights Summary</h2>
        <p className="text-on-surface-variant max-w-md">
            The AI is performing a deep analysis of your dataset, simulating multiple predictive models to uncover the most significant findings. This may take a few moments.
        </p>
    </div>
  );
};
