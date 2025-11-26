import React from 'react';

const RecentDealsTable = ({ deals }) => {
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Recently Created Deals</h2>
          <select className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-600 bg-white hover:bg-gray-50">
            <option>Last 30 days</option>
            <option>Last 7 days</option>
            <option>Last 90 days</option>
            <option>All time</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Deal Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stage</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Deal Value</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {deals.slice(0, 5).map((deal) => (
              <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">{deal.deal_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{deal.stage}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(deal.deal_value)}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(deal.status)}`}>
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
