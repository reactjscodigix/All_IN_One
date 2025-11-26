import React, { useState } from 'react';
import DataTable from './DataTable';
import contactsData from '../data/contactsData.json';

const ContactsPage = () => {
  const [contacts] = useState(contactsData.contacts);

  const getStatusBadge = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Lead': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const columns = [
    {
      key: 'firstName',
      label: 'First Name',
      sortable: true,
      render: (value) => <span className="font-medium">{value}</span>
    },
    {
      key: 'lastName',
      label: 'Last Name',
      sortable: true
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value) => <a href={`mailto:${value}`} className="text-red-600 hover:text-red-700">{value}</a>
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
      key: 'position',
      label: 'Position',
      sortable: true
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
        <h1 className="text-[1.250025rem] font-bold text-gray-900">Contacts</h1>
        <p className="text-gray-600 text-sm mt-2">Manage all your contacts and relationships</p>
      </div>

      <DataTable 
        columns={columns}
        data={contacts}
        title="All Contacts"
        searchKeys={['firstName', 'lastName', 'email', 'company']}
      />
    </div>
  );
};

export default ContactsPage;
