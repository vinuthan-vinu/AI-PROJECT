import React from 'react';
import { ThreatAnalysisResult, FlaggedEntity } from '../../types';
import { ShieldWarningIcon } from '../Icons';

interface ThreatAnalysisResultDisplayProps {
  data: ThreatAnalysisResult;
}

const ThreatLevelBadge: React.FC<{ level: FlaggedEntity['threatLevel'] }> = ({ level }) => {
  const levelStyles = {
    High: 'bg-red-500 text-red-100',
    Medium: 'bg-yellow-500 text-yellow-100',
    Low: 'bg-blue-500 text-blue-100',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${levelStyles[level]}`}>
      {level} Threat
    </span>
  );
};

export const ThreatAnalysisResultDisplay: React.FC<ThreatAnalysisResultDisplayProps> = ({ data }) => {
  const { summary, flaggedEntities, relationships } = data;

  return (
    <div className="space-y-8">
      <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg flex items-start">
        <ShieldWarningIcon className="w-6 h-6 mr-3 mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-lg">Disclaimer</h3>
          <p className="text-sm">This AI-powered analysis identifies potential risks based on patterns in the data. Results may contain biases or inaccuracies and should be used as a starting point for human review, not as a definitive judgment.</p>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-secondary mb-3">Analysis Summary</h3>
        <p className="text-on-surface-variant bg-slate-800 p-4 rounded-lg">{summary || 'No summary provided.'}</p>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-secondary mb-3">Flagged Entities</h3>
        {flaggedEntities && flaggedEntities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {flaggedEntities.map((entity) => (
              <div key={entity.entityId} className="bg-slate-800 rounded-lg p-4 shadow-md flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-on-surface text-lg">{entity.entityId}</h4>
                  <ThreatLevelBadge level={entity.threatLevel} />
                </div>
                <p className="text-sm text-on-surface-variant font-medium mb-3">{entity.reason}</p>
                <div className="mt-auto">
                    <h5 className="text-xs font-semibold text-on-surface-variant uppercase mb-2">Evidence</h5>
                    <div className="space-y-2">
                        {entity.evidence.map((ev, index) => (
                            <blockquote key={index} className="text-sm text-on-surface-variant border-l-2 border-slate-600 pl-2 italic">
                                "{ev}"
                            </blockquote>
                        ))}
                    </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-on-surface-variant bg-slate-800 p-4 rounded-lg">No entities were flagged based on the provided data sample.</p>
        )}
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-secondary mb-3">Key Relationships</h3>
         {relationships && relationships.length > 0 ? (
          <div className="space-y-3">
            {relationships.map((rel, index) => (
              <div key={index} className="bg-slate-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono bg-slate-700 px-2 py-1 rounded text-sm text-on-surface">{rel.entities[0]}</span>
                    <span className="text-on-surface-variant">&harr;</span>
                    <span className="font-mono bg-slate-700 px-2 py-1 rounded text-sm text-on-surface">{rel.entities[1]}</span>
                     <span className="ml-auto text-sm font-semibold text-on-surface-variant">({rel.sentiment})</span>
                </div>
                <p className="text-on-surface-variant text-sm">{rel.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-on-surface-variant bg-slate-800 p-4 rounded-lg">No significant relationships were identified.</p>
        )}
      </div>

    </div>
  );
};
