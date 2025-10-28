import React from 'react';
import { ClusteringResult } from '../../types';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ClusteringResultDisplayProps {
  data: ClusteringResult;
}

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];

export const ClusteringResultDisplay: React.FC<ClusteringResultDisplayProps> = ({ data }) => {
  const clusters = Array.from({ length: data.k || 0 }, (_, i) => i);

  return (
    <div>
      <h3 className="text-xl font-semibold text-on-surface mb-4">Found <span className="text-secondary">{data.k || 0}</span> Clusters</h3>
      <div className="w-full h-96 bg-slate-800 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis type="number" dataKey="x" name="Feature 1" stroke="#94a3b8" />
            <YAxis type="number" dataKey="y" name="Feature 2" stroke="#94a3b8" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
            <Legend />
            {clusters.map(clusterIndex => (
                <Scatter
                    key={`cluster-${clusterIndex}`}
                    name={`Cluster ${clusterIndex + 1}`}
                    data={(data.plotData || []).filter(p => p.cluster === clusterIndex)}
                    fill={colors[clusterIndex % colors.length]}
                />
            ))}
            <Scatter
              name="Centers"
              data={data.clusterCenters || []}
              fill="#ff0000"
              shape="star"
              legendType="star"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};