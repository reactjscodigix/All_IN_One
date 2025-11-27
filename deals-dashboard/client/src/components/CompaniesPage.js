import React, { useState } from 'react';
import DataTable from './DataTable';
import companiesData from '../data/companiesData.json';

const CompaniesPage = ({ onViewCompanyDetails }) => {
  const [companies] = useState(companiesData.companies);

  const getStatusBadge = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Prospect': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const columns = [
    {
      key: 'name',
      label: 'Company Name',
      sortable: true,
      render: (value, company) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onViewCompanyDetails?.(company);
          }}
          className="text-red-600 font-semibold hover:text-red-700 focus:outline-none"
        >
          {value}
        </button>
      )
    },
    {
      key: 'industry',
      label: 'Industry',
      sortable: true
    },
    {
      key: 'email',
      label: 'Email',
      sortable: false,
      render: (value) => <a href={`mailto:${value}`} className="text-red-600 hover:text-red-700 text-sm">{value}</a>
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false
    },
    {
      key: 'employees',
      label: 'Employees',
      sortable: true
    },
    {
      key: 'revenue',
      label: 'Revenue',
      sortable: true,
      render: (value) => <span>{formatCurrency(value)}</span>
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
        <h1 className="text-[1.250025rem] font-bold text-gray-900">Companies</h1>
        <p className="text-gray-600 text-sm mt-2">Manage all your company accounts</p>
      </div>

      <DataTable
        columns={columns}
        data={companies}
        title="All Companies"
        searchKeys={['name', 'industry', 'email']}
      />
    </div>
  );
};

export default CompaniesPage;
