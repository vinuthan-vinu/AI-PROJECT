import React, { useState, useCallback } from 'react';
import { FileUpload } from './components/FileUpload';
import { Sidebar } from './components/Sidebar';
import { AnalysisResult } from './components/AnalysisResult';
import { performAnalysis, getPredictionSuggestions, generateInsightsSummary } from './services/geminiService';
import { AnalysisType, AnalysisResultData, AnalysisOptions, PredictionSuggestion, InsightSummaryResult } from './types';
import { LogoIcon, WandIcon } from './components/Icons';
import { DataPreview } from './components/DataPreview';
import { PredictionSuggestions } from './components/PredictionSuggestions';
import { SuggestionsLoader } from './components/SuggestionsLoader';
import { InsightsSummaryDisplay } from './components/InsightsSummaryDisplay';
import { InsightsLoader } from './components/InsightsLoader';

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisType | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<AnalysisOptions>({});

  const [suggestions, setSuggestions] = useState<PredictionSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState<boolean>(false);

  const [insightsSummary, setInsightsSummary] = useState<InsightSummaryResult | null>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState<boolean>(false);

  const clearAllResults = () => {
    setAnalysisResult(null);
    setError(null);
    setInsightsSummary(null);
  }

  const handleFileSelect = async (file: File, data: string, parsedHeaders: string[]) => {
    setFile(file);
    setCsvData(data);
    setHeaders(parsedHeaders);
    setSelectedAnalysis(null);
    setSuggestions([]);
    clearAllResults();

    setIsSuggesting(true);
    try {
      const newSuggestions = await getPredictionSuggestions(data);
      setSuggestions(newSuggestions);
    } catch (e) {
      console.error("Failed to fetch suggestions:", e);
      setSuggestions([]);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleRunAnalysis = useCallback(async () => {
    if (!csvData || !selectedAnalysis) return;

    setIsLoading(true);
    clearAllResults();

    try {
      const result = await performAnalysis(csvData, selectedAnalysis, options);
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [csvData, selectedAnalysis, options]);
  
  const handleGenerateInsightsSummary = useCallback(async () => {
    if (!csvData) return;

    setIsGeneratingInsights(true);
    clearAllResults();
    setSelectedAnalysis(null);

    try {
      const result = await generateInsightsSummary(csvData);
      setInsightsSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsGeneratingInsights(false);
    }
  }, [csvData]);

  const handleSelectTool = (tool: AnalysisType) => {
    setSelectedAnalysis(tool);
    clearAllResults();
  };

  const handleApplySuggestion = (suggestion: PredictionSuggestion) => {
    setSelectedAnalysis(suggestion.analysisType);
    setOptions(suggestion.options);
    clearAllResults();
  };

  const renderMainContent = () => {
    if (!file) {
      return (
        <div className="text-center w-full max-w-lg m-auto">
          <div className="flex justify-center items-center mb-6">
            <LogoIcon className="w-16 h-16 text-primary" />
            <h1 className="text-4xl font-bold ml-4 text-on-surface">SmartInsights</h1>
          </div>
          <p className="text-on-surface-variant mb-8 text-lg">
            An AI-powered data analytics workbench. Upload a CSV file to begin.
          </p>
          <FileUpload onFileSelect={handleFileSelect} />
        </div>
      );
    }
    
    return (
      <div className="w-full h-full flex flex-col">
        <div className="bg-surface rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-on-surface">Dataset: <span className="font-mono text-secondary">{file.name}</span></h2>
              <p className="text-on-surface-variant mt-2">Select an analysis from the sidebar, or use an AI suggestion below.</p>
            </div>
            <button
              onClick={handleGenerateInsightsSummary}
              disabled={isGeneratingInsights || isLoading}
              className="bg-primary hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center shadow-lg"
            >
              <WandIcon className="w-5 h-5 mr-2" />
              {isGeneratingInsights ? 'Analyzing...' : 'Generate Insights Summary'}
            </button>
          </div>
        </div>

        {isSuggesting && <SuggestionsLoader />}
        {!isSuggesting && suggestions.length > 0 && !insightsSummary && !analysisResult && !isLoading && !isGeneratingInsights && (
          <PredictionSuggestions suggestions={suggestions} onApplySuggestion={handleApplySuggestion} />
        )}

        {csvData && !isLoading && !isGeneratingInsights && !analysisResult && !insightsSummary && <DataPreview csvData={csvData} />}
        
        <div className="flex-grow min-h-0">
           {isGeneratingInsights && <InsightsLoader />}
           {insightsSummary && <InsightsSummaryDisplay insights={insightsSummary} onClear={() => setInsightsSummary(null)} />}
          
           <AnalysisResult
            isLoading={isLoading}
            error={error}
            result={analysisResult}
            analysisType={selectedAnalysis}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background font-sans">
      <Sidebar
        headers={headers}
        selectedAnalysis={selectedAnalysis}
        onSelectAnalysis={handleSelectTool}
        onRunAnalysis={handleRunAnalysis}
        isLoading={isLoading || isGeneratingInsights}
        isFileUploaded={!!file}
        options={options}
        setOptions={setOptions}
      />
      <main className="flex-1 p-4 md:p-8 flex flex-col">
        {renderMainContent()}
      </main>
    </div>
  );
}
