import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import CustomDropdown from './CustomDropdown';
import DateRangeDropdown from './DateRangeDropdown';

const LeadsByStageChart = ({ projects, onDateRangeChange }) => {
  const [selectedPipeline, setSelectedPipeline] = useState('Marketing Pipeline');
  const [selectedPeriod, setSelectedPeriod] = useState('Last 3 Months');

  const stages = ['Conversation', 'Follow Up', 'Inpipeline'];
  const values = [320, 180, 290];

  const chartSeries = [
    {
      data: values,
      name: 'Count',
    },
  ];

  const options = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
      sparkline: { enabled: false },
    },
    colors: ['#ef4444'],
    plotOptions: {
      bar: {
        borderRadius: 0,
        horizontal: true,
        barHeight: '75%',
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => val,
      offsetX: 6,
      style: {
        fontSize: '12px',
        fontWeight: 600,
        colors: ['#6b7280'],
      },
    },
    xaxis: {
      categories: stages,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: '12px',
          colors: '#6b7280',
          fontWeight: 500,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          colors: '#374151',
          fontWeight: 500,
        },
      },
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3,
      padding: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px',
      },
      y: {
        formatter: (val) => val + ' leads',
      },
    },
    states: {
      hover: {
        filter: {
          type: 'darken',
          value: 0.15,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border-light">
      <div className="p-6 border-b border-border-light">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Leads By Stage</h2>
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

      <div className="p-6">
        {values.length > 0 ? (
          <Chart options={options} series={chartSeries} type="bar" height={280} />
        ) : (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadsByStageChart;
