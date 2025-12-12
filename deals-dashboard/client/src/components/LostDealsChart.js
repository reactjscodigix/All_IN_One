import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CustomDropdown from './CustomDropdown';
import DateRangeDropdown from './DateRangeDropdown';

const LostDealsChart = ({ deals, onDateRangeChange }) => {
  const [selectedPipeline, setSelectedPipeline] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('Last 15 Days');
  
  const stageMap = {};
  let hasLostDeals = false;
  
  deals.forEach((deal) => {
    const lostStatuses = ['Lost', 'Cancelled', 'Closed Lost', 'Rejected'];
    const isLost = lostStatuses.includes(deal.status);
    
    if (isLost) {
      hasLostDeals = true;
      const pipeline = deal.pipeline || 'Unassigned';
      const stage = deal.stage || 'No Stage';
      const key = `${pipeline} - ${stage}`;
      
      if (!stageMap[key]) {
        stageMap[key] = 0;
      }
      stageMap[key] += 1;
    }
  });

  let chartData = Object.entries(stageMap).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);
  
  if (chartData.length === 0) {
    chartData = [{
      name: 'No lost deals',
      value: 0
    }];
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border-light">
      <div className="p-2 border-b border-border-light">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Lost Deals Stage</h2>
          <div className="flex gap-2">
            <CustomDropdown
              options={['Marketing Pipeline', 'Sales Pipeline', 'Email', 'Chats', 'Operational']}
              value={selectedPipeline}
              onChange={setSelectedPipeline}
            />
            <DateRangeDropdown
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              onDateRangeChange={onDateRangeChange}
              options={['Last 15 Days', 'Last 30 Days', 'Last 7 Days']}
            />
          </div>
        </div>
      </div>

      <div className="p-2">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            barCategoryGap="30%"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={110} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
              }}
              formatter={(value) => value === 0 ? 'No data' : value}
            />
            <Bar dataKey="value" fill="#ef4444" radius={[0, 0, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LostDealsChart;
