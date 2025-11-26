import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DealsByStageChart = ({ deals }) => {
  const chartData = [];
  const stageMap = {};

  deals.forEach((deal) => {
    if (!stageMap[deal.stage]) {
      stageMap[deal.stage] = 0;
    }
    stageMap[deal.stage] += 1;
  });

  const stageOrder = ['Inpipeline', 'Follow Up', 'Schedule Conversation', 'Conversation', 'Won', 'Lost'];
  
  stageOrder.forEach((stage) => {
    if (stageMap[stage]) {
      chartData.push({
        name: stage,
        deals: stageMap[stage],
      });
    }
  });

  Object.keys(stageMap).forEach((stage) => {
    if (!stageOrder.includes(stage)) {
      chartData.push({
        name: stage,
        deals: stageMap[stage],
      });
    }
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Deals By Stage</h2>
          <div className="flex gap-2">
            <select className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 bg-white hover:bg-gray-50">
              <option>Sales Pipeline</option>
            </select>
            <select className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 bg-white hover:bg-gray-50">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
              <option>All time</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
              />
              <Bar dataKey="deals" fill="#14b8a6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No deals data available
          </div>
        )}
      </div>
    </div>
  );
};

export default DealsByStageChart;
