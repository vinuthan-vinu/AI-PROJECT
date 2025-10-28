import React from 'react';
import { AnalysisType, AnalysisOptions } from '../types';
import { LogoIcon, ChartIcon, ClusterIcon, TargetIcon, TrendIcon, BrainIcon, ShieldWarningIcon, SparklesIcon } from './Icons';

interface SidebarProps {
  headers: string[];
  selectedAnalysis: AnalysisType | null;
  onSelectAnalysis: (type: AnalysisType) => void;
  onRunAnalysis: () => void;
  isLoading: boolean;
  isFileUploaded: boolean;
  options: AnalysisOptions;
  setOptions: React.Dispatch<React.SetStateAction<AnalysisOptions>>;
}

const allTools = [
  { type: AnalysisType.DataCleaner, icon: <SparklesIcon className="w-5 h-5" /> },
  { type: AnalysisType.EDA, icon: <ChartIcon className="w-5 h-5" /> },
  { type: AnalysisType.Clustering, icon: <ClusterIcon className="w-5 h-5" /> },
  { type: AnalysisType.Classification, icon: <TargetIcon className="w-5 h-5" /> },
  { type: AnalysisType.Regression, icon: <TrendIcon className="w-5 h-5" /> },
  { type: AnalysisType.TimeSeries, icon: <BrainIcon className="w-5 h-5" /> },
  { type: AnalysisType.ThreatAnalysis, icon: <ShieldWarningIcon className="w-5 h-5" /> },
];

const OptionSelector: React.FC<{ label: string, value: string | undefined, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, headers: string[] }> = ({ label, value, onChange, headers }) => (
    <div className="mt-4">
        <label className="block text-sm font-medium text-on-surface-variant mb-1">{label}</label>
        <select
            value={value || ''}
            onChange={onChange}
            className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm text-on-surface"
        >
            <option value="">Select a column</option>
            {headers.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
    </div>
);

const MultiOptionSelector: React.FC<{ label: string, value: string[] | undefined, onChange: (values: string[]) => void, headers: string[] }> = ({ label, value = [], onChange, headers }) => {
    const handleSelect = (header: string) => {
        const newValue = value.includes(header) ? value.filter(h => h !== header) : [...value, header];
        onChange(newValue);
    };

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-on-surface-variant mb-2">{label}</label>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-2">
                {headers.map(h => (
                    <label key={h} className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={value.includes(h)}
                            onChange={() => handleSelect(h)}
                            className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                        />
                        <span className="text-on-surface text-sm">{h}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export const Sidebar: React.FC<SidebarProps> = ({ headers, selectedAnalysis, onSelectAnalysis, onRunAnalysis, isLoading, isFileUploaded, options, setOptions }) => {

  const renderOptions = () => {
    if (!selectedAnalysis || !isFileUploaded) return null;
    switch (selectedAnalysis) {
      case AnalysisType.Clustering:
        return <MultiOptionSelector label="Select 2+ Columns for Clustering" value={options.clusteringColumns} onChange={(v) => setOptions(prev => ({ ...prev, clusteringColumns: v }))} headers={headers} />;
      case AnalysisType.Classification:
        return <OptionSelector label="Target Column" value={options.classificationTarget} onChange={(e) => setOptions(prev => ({...prev, classificationTarget: e.target.value}))} headers={headers} />;
      case AnalysisType.Regression:
        return <OptionSelector label="Target Column" value={options.regressionTarget} onChange={(e) => setOptions(prev => ({...prev, regressionTarget: e.target.value}))} headers={headers} />;
      case AnalysisType.TimeSeries:
        return (
          <>
            <OptionSelector label="Date/Time Column" value={options.timeSeriesDateCol} onChange={(e) => setOptions(prev => ({...prev, timeSeriesDateCol: e.target.value}))} headers={headers} />
            <OptionSelector label="Value Column" value={options.timeSeriesValueCol} onChange={(e) => setOptions(prev => ({...prev, timeSeriesValueCol: e.target.value}))} headers={headers} />
          </>
        );
      case AnalysisType.ThreatAnalysis:
        return (
          <>
            <OptionSelector label="Text Column for Analysis" value={options.threatTextCol} onChange={(e) => setOptions(prev => ({...prev, threatTextCol: e.target.value}))} headers={headers} />
            <OptionSelector label="Entity/Identifier Column" value={options.threatEntityCol} onChange={(e) => setOptions(prev => ({...prev, threatEntityCol: e.target.value}))} headers={headers} />
          </>
        );
      default:
        return null;
    }
  };
    
  return (
    <aside className="w-full md:w-80 bg-surface p-6 flex flex-col shadow-lg md:h-screen md:sticky md:top-0">
      <div className="flex items-center mb-8">
        <LogoIcon className="w-10 h-10 text-primary" />
        <h1 className="text-2xl font-bold ml-3 text-on-surface">SmartInsights</h1>
      </div>
      <nav className="flex-1 overflow-y-auto">
        <div className="mb-6">
            <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3 px-3">Data Tools</h2>
            <ul className="space-y-2">
            {allTools.map(({ type, icon }) => (
                <li key={type}>
                <button
                    onClick={() => onSelectAnalysis(type)}
                    disabled={!isFileUploaded}
                    className={`w-full flex items-center p-3 rounded-lg text-left transition-colors duration-200 ${
                    selectedAnalysis === type ? 'bg-primary text-white shadow-md' : 'text-on-surface hover:bg-slate-700'
                    } ${!isFileUploaded ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {icon}
                    <span className="ml-4 font-medium">{type}</span>
                </button>
                </li>
            ))}
            </ul>
        </div>

        {isFileUploaded && selectedAnalysis !== AnalysisType.DataCleaner && (
          <div className="mt-6 p-4 bg-slate-800 rounded-lg">
            <h3 className="font-semibold text-on-surface mb-2">Options</h3>
            {renderOptions() || <p className="text-sm text-on-surface-variant">Select an analysis to see its options.</p>}
          </div>
        )}
      </nav>
      <div className="mt-auto pt-6">
        {isFileUploaded && (
          <button
            onClick={onRunAnalysis}
            disabled={!selectedAnalysis || isLoading}
            className="w-full bg-secondary hover:bg-emerald-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center shadow-lg"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Run Analysis'}
          </button>
        )}
      </div>
    </aside>
  );
};