export enum AnalysisType {
  EDA = 'Exploratory Data Analysis',
  Clustering = 'Clustering',
  Classification = 'Classification',
  Regression = 'Regression',
  TimeSeries = 'Time-Series Forecasting',
  ThreatAnalysis = 'Threat & Relationship Analysis',
}

export interface SummaryStat {
  columnName: string;
  mean: number;
  std: number;
  min: number;
  p25: number;
  p50: number;
  p75: number;
  max: number;
}

export interface ValueCount {
  columnName: string;
  counts: { value: string; count: number }[];
}

export interface MissingValue {
  columnName: string;
  count: number;
}

export interface CorrelationRow {
  columnName: string;
  values: { columnName: string; value: number }[];
}

export interface EDAResult {
  summaryStats: SummaryStat[];
  valueCounts: ValueCount[];
  missingValues: MissingValue[];
  correlations?: CorrelationRow[];
}

export interface ClusteringResult {
  plotData: { x: number; y: number; cluster: number }[];
  clusterCenters: { x: number; y: number }[];
  k: number;
}

export interface ClassificationReportItem {
  className: string;
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
}

export interface ClassificationResult {
  accuracy: number;
  report: ClassificationReportItem[];
  featureImportances: { feature: string; importance: number }[];
}

export interface RegressionResult {
  rmse: number;
  r2: number;
  featureImportances: { feature: string; importance: number }[];
  predictions: { actual: number; predicted: number }[];
}

export interface TimeSeriesResult {
  forecast: { date: string; value: number }[];
  historical: { date: string; value: number }[];
}

export interface FlaggedEntity {
  entityId: string;
  threatLevel: 'High' | 'Medium' | 'Low';
  reason: string;
  evidence: string[];
}

export interface Relationship {
    entities: string[];
    description: string;
    sentiment: string;
}

export interface ThreatAnalysisResult {
    summary: string;
    flaggedEntities: FlaggedEntity[];
    relationships: Relationship[];
}

export type AnalysisResultData =
  | EDAResult
  | ClusteringResult
  | ClassificationResult
  | RegressionResult
  | TimeSeriesResult
  | ThreatAnalysisResult;

export interface AnalysisOptions {
  clusteringColumns?: string[];
  classificationTarget?: string;
  regressionTarget?: string;
  timeSeriesDateCol?: string;
  timeSeriesValueCol?: string;
  threatTextCol?: string;
  threatEntityCol?: string;
}

export interface PredictionSuggestion {
  title: string;
  analysisType: AnalysisType;
  options: AnalysisOptions;
  justification: string;
}

export interface Insight {
  title: string;
  description: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export type InsightSummaryResult = Insight[];
