import React, { useState, useEffect } from 'react';
import DataTable from './DataTable';
import leadsData from '../data/leadsData.json';
import { Star, Plus } from 'lucide-react';
import AddNewLeadModal from './AddNewLeadModal';
import { leadsAPI, companiesAPI } from '../services/api';

const LeadsPage = () => {
  const [leads, setLeads] = useState(leadsData.leads);
  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, companiesRes] = await Promise.all([
          leadsAPI.getAll(),
          companiesAPI.getAll(),
        ]);

        if (leadsRes && Array.isArray(leadsRes)) {
          const formattedLeads = leadsRes.map(lead => ({
            id: lead.id,
            name: lead.first_name && lead.last_name 
              ? `${lead.first_name} ${lead.last_name}` 
              : lead.name || 'Unknown',
            email: lead.email || '',
            phone: lead.phone || '',
            company: lead.company_name || lead.company || '',
            source: lead.source || 'Website',
            status: lead.status || 'New',
            rating: lead.rating || 5,
            ...lead
          }));
          setLeads(formattedLeads);
        } else {
          setLeads(leadsData.leads);
        }

        if (companiesRes && Array.isArray(companiesRes)) {
          setCompanies(companiesRes);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setLeads(leadsData.leads);
      }
    };

    fetchData();
  }, []);

  const handleCreateLead = async (formData) => {
    try {
      const response = await leadsAPI.create(formData);
      
      if (response.id) {
        const newLead = {
          id: response.id,
          name: formData.name || 'New Lead',
          email: formData.email || '',
          phone: formData.phone || '',
          company: formData.company || '',
          source: formData.source || 'Website',
          status: formData.status || 'New',
          rating: formData.rating || 5,
          ...formData
        };
        
        setLeads(prev => [newLead, ...prev]);
        setIsModalOpen(false);
      }
    } catch (err) {
      throw new Error(err.message || 'Failed to create lead');
    }
  };

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[1.250025rem] font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600 text-sm mt-2">Manage all your sales leads</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition text-[13px]">
          <Plus size={16} /> Add New Lead
        </button>
      </div>

      <DataTable 
        columns={columns}
        data={leads}
        title="All Leads"
        searchKeys={['name', 'email', 'company']}
      />

      <AddNewLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLead}
        companies={companies}
      />
    </div>
  );
};

export default LeadsPage;
