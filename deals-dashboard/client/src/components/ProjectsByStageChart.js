import React, { useState } from 'react';
import CustomDropdown from './CustomDropdown';
import DateRangeDropdown from './DateRangeDropdown';

const ProjectsByStageChart = ({ projects, onDateRangeChange }) => {
  const [selectedPipeline, setSelectedPipeline] = useState('Sales Pipeline');
  const [selectedPeriod, setSelectedPeriod] = useState('Last 3 Months');

  const stageData = [
    { name: 'Inpipeline', value: 1454, color: '#6366f1', widthPercent: 100 },
    { name: 'Follow Up', value: 1454, color: '#06b6d4', widthPercent: 85 },
    { name: 'Schedule Service', value: 1454, color: '#f59e0b', widthPercent: 70 },
    { name: 'Conversation', value: 1454, color: '#14b8a6', widthPercent: 55 },
    { name: 'Win', value: 1454, color: '#34d399', widthPercent: 40 },
    { name: 'Lost', value: 1454, color: '#ef4444', widthPercent: 25 },
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
              options={['Last 3 Months', 'Last 6 Months', 'Last 12 Months']}
            />
          </div>
        </div>
      </div>

      <div className="p-2">
        {stageData.length > 0 ? (
          <>
            <div className=" flex flex-col items-center">
              {stageData.map((item) => (
                <div key={item.name} className="w-full flex justify-center">
                  <div
                    className="flex items-center justify-center text-white  font-bold text-base  transition-all hover:shadow-lg"
                    style={{
                      width: `${item.widthPercent}%`,
                      backgroundColor: item.color,
                      padding: '12px 16px',
                      minHeight: '48px',
                      fontSize: '10px',
                    }}
                  >
                    {item.name} : {item.value}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-xs text-gray-500">
              This data collected based on the Projects for last 30 days
            </div>
          </>
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsByStageChart;
