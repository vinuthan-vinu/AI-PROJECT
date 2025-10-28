import React from 'react';
import { TimeSeriesResult } from '../../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface TimeSeriesResultDisplayProps {
  data: TimeSeriesResult;
}

export const TimeSeriesResultDisplay: React.FC<TimeSeriesResultDisplayProps> = ({ data }) => {
  const historicalData = data.historical || [];
  const forecastData = data.forecast || [];

  const combinedData = [
    ...historicalData.map(d => ({ ...d, type: 'Historical' })),
    ...forecastData.map(d => ({ ...d, type: 'Forecast' })),
  ];

  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <h3 className="text-xl font-semibold mb-4 text-secondary">Time-Series Forecast</h3>
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
            <Legend />
            <Line type="monotone" dataKey="value" name="Historical" stroke="#8884d8" data={historicalData} dot={false} />
            <Line type="monotone" dataKey="value" name="Forecast" stroke="#10b981" strokeDasharray="5 5" data={forecastData} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};