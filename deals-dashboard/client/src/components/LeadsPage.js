import React, { useState } from 'react';
import DataTable from './DataTable';
import leadsData from '../data/leadsData.json';
import { Star } from 'lucide-react';

const LeadsPage = () => {
  const [leads] = useState(leadsData.leads);

  const getStatusBadge = (status) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-800',
      'Qualified': 'bg-green-100 text-green-800',
      'Contacted': 'bg-yellow-100 text-yellow-800',
      'Unqualified': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  const columns = [
    {
      key: 'name',
      label: 'Lead Name',
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value) => <a href={`mailto:${value}`} className="text-red-600 hover:text-red-700 text-sm">{value}</a>
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false
    },
    {
      key: 'company',
      label: 'Company',
      sortable: true
    },
    {
      key: 'source',
      label: 'Source',
      sortable: true
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (value) => renderStars(value)
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
        <h1 className="text-[1.250025rem] font-bold text-gray-900">Leads</h1>
        <p className="text-gray-600 text-sm mt-2">Manage all your sales leads</p>
      </div>

      <DataTable 
        columns={columns}
        data={leads}
        title="All Leads"
        searchKeys={['name', 'email', 'company']}
      />
    </div>
  );
};

export default LeadsPage;
