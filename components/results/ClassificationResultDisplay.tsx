import React from 'react';
import { ClassificationResult } from '../../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ClassificationResultDisplayProps {
  data: ClassificationResult;
}

export const ClassificationResultDisplay: React.FC<ClassificationResultDisplayProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-slate-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-secondary">Model Performance</h3>
        <p className="text-4xl font-bold text-on-surface">{(data.accuracy * 100).toFixed(2)}%</p>
        <p className="text-on-surface-variant">Accuracy</p>
        <div className="mt-6">
            <h4 className="font-semibold text-on-surface mb-2">Classification Report</h4>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-on-surface uppercase bg-slate-700">
                        <tr>
                            <th className="py-2 px-3">Class</th>
                            <th className="py-2 px-3">Precision</th>
                            <th className="py-2 px-3">Recall</th>
                            <th className="py-2 px-3">F1-Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.report && data.report.map((item) => (
                            <tr key={item.className} className="border-b border-slate-700">
                                <td className="py-2 px-3 font-medium">{item.className}</td>
                                <td className="py-2 px-3">{item.precision?.toFixed(2) ?? 'N/A'}</td>
                                <td className="py-2 px-3">{item.recall?.toFixed(2) ?? 'N/A'}</td>
                                <td className="py-2 px-3">{item.f1Score?.toFixed(2) ?? 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
      <div className="bg-slate-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-secondary">Feature Importances</h3>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.featureImportances || []} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="feature" type="category" stroke="#94a3b8" width={100} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}/>
              <Legend />
              <Bar dataKey="importance" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};