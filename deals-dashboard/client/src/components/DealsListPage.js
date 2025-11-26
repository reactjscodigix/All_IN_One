import React, { useState } from 'react';
import DataTable from './DataTable';
import dealsData from '../data/dealsData.json';

const DealsListPage = () => {
  const [deals] = useState(dealsData.deals);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadge = (status) => {
    const colors = {
      'Won': 'bg-green-100 text-green-800',
      'Lost': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'name',
      label: 'Deal Name',
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'company',
      label: 'Company',
      sortable: true
    },
    {
      key: 'contact',
      label: 'Contact Person',
      sortable: true
    },
    {
      key: 'stage',
      label: 'Stage',
      sortable: true
    },
    {
      key: 'value',
      label: 'Value',
      sortable: true,
      render: (value) => <span className="font-medium">{formatCurrency(value)}</span>
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(value)}`}>
          {value}
        </span>
      )
    }
  ];

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-[1.250025rem] font-bold text-gray-900">Deals</h1>
        <p className="text-gray-600 text-sm mt-2">Manage all your deals in one place</p>
      </div>

      <DataTable 
        columns={columns}
        data={deals}
        title="All Deals"
        searchKeys={['name', 'company', 'contact']}
      />
    </div>
  );
};

export default DealsListPage;
