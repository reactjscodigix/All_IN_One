import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CustomDropdown from './CustomDropdown';
import DateRangeDropdown from './DateRangeDropdown';

const LeadsProjectsAreaChart = ({ leads, onDateRangeChange }) => {
  const [selectedPipeline, setSelectedPipeline] = useState('Sales Pipeline');
  const [selectedPeriod, setSelectedPeriod] = useState('Last 30 Days');

  const chartData = [
    { month: 'Jan', value: 3200 },
    { month: 'Feb', value: 2800 },
    { month: 'Mar', value: 3800 },
    { month: 'Apr', value: 3200 },
    { month: 'May', value: 4100 },
    { month: 'Jun', value: 3500 },
    { month: 'Jul', value: 4200 },
    { month: 'Aug', value: 3800 },
    { month: 'Sep', value: 4100 },
    { month: 'Oct', value: 4500 },
    { month: 'Nov', value: 4000 },
    { month: 'Dec', value: 3900 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border-light">
      <div className="p-2 border-b border-border-light">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Projects By Stage</h2>
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
          <ResponsiveContainer width="100%" >
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#a78bfa"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsProjectsAreaChart;
