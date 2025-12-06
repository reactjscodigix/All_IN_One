import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CustomDropdown from './CustomDropdown';
import DateRangeDropdown from './DateRangeDropdown';

const DealsByYearChart = ({ deals, onDateRangeChange }) => {
  const [selectedPipeline, setSelectedPipeline] = useState('Marketing Pipeline');
  const [selectedPeriod, setSelectedPeriod] = useState('Last 15 Days');
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthMap = {};
  
  monthNames.forEach((month, index) => {
    monthMap[index] = 0;
  });

  deals.forEach((deal) => {
    if (deal.createdAt) {
      const date = new Date(deal.createdAt);
      const month = date.getMonth();
      monthMap[month] = (monthMap[month] || 0) + 1;
    }
  });

  const chartData = monthNames.map((month, index) => ({
    month,
    deals: monthMap[index] || 0
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border-light">
      <div className="p-2 border-b border-border-light">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Deals by Year</h2>
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
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="deals" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
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

export default DealsByYearChart;
