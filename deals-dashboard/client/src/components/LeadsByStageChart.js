import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import CustomDropdown from './CustomDropdown';
import DateRangeDropdown from './DateRangeDropdown';
import { MoreVertical, Eye, Trash2, Edit2 } from 'lucide-react';

const LeadsByStageChart = ({ projects, onDateRangeChange }) => {
  const [selectedPipeline, setSelectedPipeline] = useState('Marketing Pipeline');
  const [selectedPeriod, setSelectedPeriod] = useState('Last 3 Months');
  const [openActionMenu, setOpenActionMenu] = useState(null);

  const stages = ['Conversation', 'Follow Up', 'Inpipeline'];
  const values = [320, 180, 290];
  
  const stageData = [
    { stage: 'Conversation', count: 320, status: 'active', percentage: 38 },
    { stage: 'Follow Up', count: 180, status: 'pending', percentage: 22 },
    { stage: 'Inpipeline', count: 290, status: 'active', percentage: 35 },
  ];
  
  const totalLeads = values.reduce((a, b) => a + b, 0);

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

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { bg: '#28C76F', text: 'white', label: 'Active' },
      pending: { bg: '#1890FF', text: 'white', label: 'Pending' },
      inactive: { bg: '#F62416', text: 'white', label: 'Inactive' },
    };
    const config = statusConfig[status] || statusConfig.active;
    return (
      <span
        style={{
          backgroundColor: config.bg,
          color: config.text,
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          display: 'inline-block',
        }}
      >
        {config.label}
      </span>
    );
  };

  const handleActionClick = (stage) => {
    setOpenActionMenu(openActionMenu === stage ? null : stage);
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

      <div className="border-t border-border-light p-6" style={{ overflow: 'visible' }}>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Analysis Breakdown</h3>
        <div className="space-y-3" style={{ overflow: 'visible' }}>
          {stageData.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition"
              style={{ overflow: 'visible', position: 'relative' }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">{item.stage}</span>
                  {getStatusBadge(item.status)}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1.5 bg-gray-300 rounded-full" style={{ width: '100px' }}>
                    <div
                      className="h-full bg-red-500 rounded-full transition"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{item.percentage}%</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                <div className="relative" style={{ overflow: 'visible', zIndex: 50 }}>
                  <button
                    style={{
                      background: '#F62416',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      minWidth: '28px',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = '#e01810')}
                    onMouseLeave={(e) => (e.target.style.background = '#F62416')}
                    onClick={() => handleActionClick(item.stage)}
                    title="More options"
                  >
                    <MoreVertical size={16} color="white" />
                  </button>
                  {openActionMenu === item.stage && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
                        zIndex: 1000,
                        minWidth: '160px',
                        marginTop: '4px',
                        overflow: 'visible',
                      }}
                    >
                      <button
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          color: '#374151',
                          cursor: 'pointer',
                          width: '100%',
                          border: 'none',
                          background: 'transparent',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.target.style.background = '#f9fafb')}
                        onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                      >
                        <Edit2 size={14} />
                        Edit
                      </button>
                      <button
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          color: '#374151',
                          cursor: 'pointer',
                          width: '100%',
                          border: 'none',
                          background: 'transparent',
                          borderBottom: '1px solid #e5e7eb',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.target.style.background = '#f9fafb')}
                        onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          color: '#f62416',
                          cursor: 'pointer',
                          width: '100%',
                          border: 'none',
                          background: 'transparent',
                          textAlign: 'left',
                        }}
                        onMouseEnter={(e) => (e.target.style.background = '#fff5f5')}
                        onMouseLeave={(e) => (e.target.style.background = 'transparent')}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border-light">
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Total Leads</p>
            <p className="text-xl font-bold text-gray-900">{totalLeads}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Highest Stage</p>
            <p className="text-xl font-bold text-gray-900">Conversation</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-600 mb-1">Conversion Rate</p>
            <p className="text-xl font-bold text-gray-900">56.25%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadsByStageChart;
