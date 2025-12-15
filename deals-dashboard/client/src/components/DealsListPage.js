import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import DataTable from './DataTable';
import AddNewDealModal from './AddNewDealModal';
import { dealsAPI, contactsAPI, companiesAPI } from '../services/api';
import dealsDataJson from '../data/dealsData.json';

const DealsListPage = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError('');
      let dealsRes, contactsRes, companiesRes;
      
      try {
        [dealsRes, contactsRes, companiesRes] = await Promise.all([
          dealsAPI.getAll(),
          contactsAPI.getAll(),
          companiesAPI.getAll(),
        ]);
      } catch (apiErr) {
        console.warn('⚠️ API unavailable, using mock data:', apiErr.message);
        dealsRes = dealsDataJson;
        contactsRes = [];
        companiesRes = [];
      }
      
      console.log('✅ DealsListPage - API Response:', { dealsRes, contactsRes, companiesRes });
      
      let actualDeals = dealsRes || [];
      if (dealsRes && !Array.isArray(dealsRes) && typeof dealsRes === 'object') {
        if (dealsRes.data && Array.isArray(dealsRes.data)) {
          actualDeals = dealsRes.data;
        } else if (dealsRes.deals && Array.isArray(dealsRes.deals)) {
          actualDeals = dealsRes.deals;
        } else if (dealsRes.rows && Array.isArray(dealsRes.rows)) {
          actualDeals = dealsRes.rows;
        }
      }
      
      let actualContacts = contactsRes || [];
      if (contactsRes && !Array.isArray(contactsRes) && typeof contactsRes === 'object') {
        if (contactsRes.data && Array.isArray(contactsRes.data)) {
          actualContacts = contactsRes.data;
        } else if (contactsRes.contacts && Array.isArray(contactsRes.contacts)) {
          actualContacts = contactsRes.contacts;
        }
      }
      
      let actualCompanies = companiesRes || [];
      if (companiesRes && !Array.isArray(companiesRes) && typeof companiesRes === 'object') {
        if (companiesRes.data && Array.isArray(companiesRes.data)) {
          actualCompanies = companiesRes.data;
        } else if (companiesRes.companies && Array.isArray(companiesRes.companies)) {
          actualCompanies = companiesRes.companies;
        }
      }
      
      console.log('✅ DealsListPage - Data extracted:', { actualDeals, actualContacts, actualCompanies });
      
      const transformedDeals = (actualDeals || []).map(deal => {
        const company = actualCompanies?.find(c => c.id === deal.company_id);
        const contact = actualContacts?.find(c => c.id === deal.contact_id);
        
        const contactName = contact 
          ? `${contact.first_name || ''} ${contact.last_name || ''}`.trim()
          : (deal.contact_first_name && deal.contact_last_name 
              ? `${deal.contact_first_name} ${deal.contact_last_name}`
              : 'N/A');
        
        const assignedName = deal.assignee_first_name && deal.assignee_last_name
          ? `${deal.assignee_first_name} ${deal.assignee_last_name}`
          : 'Unassigned';
        
        const email = deal.contact_email || 'N/A';
        const phone = deal.contact_phone || 'N/A';
        
        return {
          id: deal.id,
          name: deal.deal_name,
          company: company?.company_name || deal.company_name || 'N/A',
          contact: contactName,
          email: email,
          phone: phone,
          location: deal.location || 'N/A',
          assigned_name: assignedName,
          stage: deal.pipeline || deal.deal_stage || 'Unclassified',
          value: parseFloat(deal.deal_value) || 0,
          status: deal.status || 'Pending',
          deal_name: deal.deal_name,
          company_id: deal.company_id,
          contact_id: deal.contact_id,
          ...deal
        };
      });
      
      console.log('✅ DealsListPage - Transformed Deals:', transformedDeals);
      
      setDeals(transformedDeals);
      setContacts(actualContacts);
      setCompanies(actualCompanies);
    } catch (err) {
      console.error('❌ DealsListPage - Error fetching data:', err);
      setError(`Failed to load deals data from server: ${err.message}`);
      setDeals((dealsDataJson.deals || []).map(deal => ({
        id: deal.id,
        name: deal.name,
        company: deal.company,
        contact: deal.contact,
        email: deal.email,
        phone: deal.phone,
        location: deal.location,
        assigned_name: deal.assigned_name,
        stage: deal.stage,
        value: deal.value,
        status: deal.status,
        ...deal
      })));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDeal = async (formData) => {
    try {
      const response = await dealsAPI.create(formData);
      
      if (response.id) {
        setIsModalOpen(false);
        await fetchData();
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
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value) => <span className="text-sm text-gray-600">{value}</span>
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: true,
      render: (value) => <span className="text-sm text-gray-600">{value}</span>
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: (value) => <span className="text-sm text-gray-600">{value}</span>
    },
    {
      key: 'assigned_name',
      label: 'Assigned To',
      sortable: true,
      render: (value) => <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">{value}</span>
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
        searchKeys={['name', 'company', 'contact', 'email', 'phone', 'location', 'assigned_name', 'stage']}
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
