import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DataTable from './DataTable';
import AddNewDealModal from './AddNewDealModal';
import { dealsAPI, contactsAPI, companiesAPI } from '../services/api';

const DealsListPage = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [dealsRes, contactsRes, companiesRes] = await Promise.all([
          dealsAPI.getAll(),
          contactsAPI.getAll(),
          companiesAPI.getAll(),
        ]);
        
        console.log('✅ DealsListPage - API Response:', { dealsRes, contactsRes, companiesRes });
        
        const transformedDeals = (dealsRes || []).map(deal => ({
          id: deal.id,
          name: deal.deal_name,
          company: deal.company_name || 'Unknown',
          contact: deal.contact_id ? `${deal.first_name || ''} ${deal.last_name || ''}`.trim() : 'N/A',
          stage: deal.pipeline || deal.deal_stage || 'Unclassified',
          value: parseFloat(deal.deal_value) || 0,
          status: deal.status || 'Pending',
          deal_name: deal.deal_name,
          company_id: deal.company_id,
          contact_id: deal.contact_id,
          ...deal
        }));
        
        console.log('✅ DealsListPage - Transformed Deals:', transformedDeals);
        
        setDeals(transformedDeals);
        setContacts(contactsRes || []);
        setCompanies(companiesRes || []);
      } catch (err) {
        console.error('❌ DealsListPage - Error fetching data:', err);
        setError(`Failed to load deals data from server: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreateDeal = async (formData) => {
    try {
      const response = await dealsAPI.create(formData);
      
      if (response.id) {
        const newDeal = {
          id: response.id,
          ...formData,
          created_at: new Date().toISOString(),
        };
        
        setDeals(prev => [newDeal, ...prev]);
        setIsModalOpen(false);
      }
    } catch (err) {
      throw new Error(err.message || 'Failed to create deal');
    }
  };

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

  if (isLoading) {
    return (
      <div className="p-2 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading deals...</div>
      </div>
    );
  }

  return (
    <div className="p-2 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-[1.250025rem] font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600 text-sm mt-2">Manage all your deals in one place</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
        >
          <Plus size={18} /> Add New Deal
        </button>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">{error}</p>
        </div>
      )}

      <DataTable 
        columns={columns}
        data={deals}
        title="All Deals"
        searchKeys={['name', 'company', 'contact', 'stage']}
      />

      <AddNewDealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateDeal}
        contacts={contacts}
        companies={companies}
      />
    </div>
  );
};

export default DealsListPage;
