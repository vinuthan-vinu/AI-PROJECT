import React from 'react';
import { RegressionResult } from '../../types';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface RegressionResultDisplayProps {
  data: RegressionResult;
}

export const RegressionResultDisplay: React.FC<RegressionResultDisplayProps> = ({ data }) => {
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-secondary">Root Mean Squared Error (RMSE)</h3>
                <p className="text-4xl font-bold text-on-surface">{data.rmse?.toFixed(4) ?? 'N/A'}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-secondary">R-squared (R²)</h3>
                <p className="text-4xl font-bold text-on-surface">{data.r2?.toFixed(4) ?? 'N/A'}</p>
            </div>
        </div>

      <div className="bg-slate-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-secondary">Actual vs. Predicted Values</h3>
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis type="number" dataKey="actual" name="Actual" stroke="#94a3b8" />
              <YAxis type="number" dataKey="predicted" name="Predicted" stroke="#94a3b8" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Scatter name="Predictions" data={data.predictions || []} fill="#8884d8" shape="circle" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};