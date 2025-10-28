import React from 'react';
import { AnalysisResultData, AnalysisType } from '../types';
import { Loader } from './Loader';
import { ErrorMessage } from './ErrorMessage';
import { EDAResultDisplay } from './results/EDAResultDisplay';
import { ClusteringResultDisplay } from './results/ClusteringResultDisplay';
import { ClassificationResultDisplay } from './results/ClassificationResultDisplay';
import { RegressionResultDisplay } from './results/RegressionResultDisplay';
import { TimeSeriesResultDisplay } from './results/TimeSeriesResultDisplay';
import { ThreatAnalysisResultDisplay } from './results/ThreatAnalysisResultDisplay';
import { DataCleanerResultDisplay } from './results/DataCleanerResultDisplay';
import { InfoIcon } from './Icons';

interface AnalysisResultProps {
  isLoading: boolean;
  error: string | null;
  result: AnalysisResultData | null;
  analysisType: AnalysisType | null;
  onApplyCleanedData?: (cleanedData: Record<string, any>[]) => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ isLoading, error, result, analysisType, onApplyCleanedData }) => {
  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!result || !analysisType) {
    return (
      <div className="flex items-center justify-center h-full bg-surface rounded-lg">
        <p className="text-on-surface-variant text-lg">Your analysis results will appear here.</p>
      </div>
    );
  }

  const renderResult = () => {
    switch (analysisType) {
      case AnalysisType.DataCleaner:
        return <DataCleanerResultDisplay data={result as any} onApply={onApplyCleanedData!} />;
      case AnalysisType.EDA:
        return <EDAResultDisplay data={result as any} />;
      case AnalysisType.Clustering:
        return <ClusteringResultDisplay data={result as any} />;
      case AnalysisType.Classification:
        return <ClassificationResultDisplay data={result as any} />;
      case AnalysisType.Regression:
        return <RegressionResultDisplay data={result as any} />;
      case AnalysisType.TimeSeries:
        return <TimeSeriesResultDisplay data={result as any} />;
      case AnalysisType.ThreatAnalysis:
        return <ThreatAnalysisResultDisplay data={result as any} />;
      default:
        return <p>Unknown analysis type.</p>;
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6 h-full overflow-y-auto">
      <h2 className="text-3xl font-bold text-on-surface mb-6">{analysisType} Results</h2>
      
      {/* General AI Disclaimer */}
      {analysisType !== AnalysisType.ThreatAnalysis && analysisType !== AnalysisType.DataCleaner && (
        <div className="bg-blue-900/50 border border-blue-700 text-blue-200 px-4 py-3 rounded-lg flex items-start mb-6">
          <InfoIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm">
              <strong>AI-Generated Analysis:</strong> Results are for informational purposes only and may contain inaccuracies. Always verify critical findings with domain expertise.
            </p>
          </div>
        </div>
      )}

      {renderResult()}
    </div>
  );
};