import React, { useState } from 'react';
import DateRangeDropdown from './DateRangeDropdown';

const RecentDealsTable = ({ deals, onDateRangeChange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Last 15 Days');

  const getStatusColor = (status) => {
    switch (status) {
      case 'Won':
        return 'bg-green-100 text-green-800';
      case 'Lost':
        return 'bg-red-100 text-red-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-border-light">
      <div className="py-[0.9375rem] px-[1.25rem] border-b border-border-light">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recently Created Deals</h2>
          <DateRangeDropdown
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            onDateRangeChange={onDateRangeChange}
            options={['Last 15 Days', 'Last 30 Days']}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-border-light">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[180px]">Deal Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[160px]">Pipeline / Stage</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[100px]">Deal Value</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 min-w-[100px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {deals.slice(0, 5).map((deal) => (
              <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-xs font-medium text-gray-900">{deal.name || 'N/A'}</td>
                <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                  {deal.pipeline || deal.stage ? (
                    <>
                      {deal.pipeline && <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">{deal.pipeline}</span>}
                      {deal.stage && <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">{deal.stage}</span>}
                    </>
                  ) : (
                    'N/A'
                  )}
                </td>
                <td className="px-6 py-4 text-xs font-medium text-gray-900">{formatCurrency(deal.value)}</td>
                <td className="px-6 py-4 text-xs">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
                    {deal.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deals.length === 0 && (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-500">No deals found</p>
        </div>
      )}
    </div>
  );
};

export default RecentDealsTable;
