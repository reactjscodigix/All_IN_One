import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../common/DataTable';
import leadsData from '../../data/leadsData.json';
import { Star, Plus, Filter } from 'lucide-react';
import AddNewLeadModal from './AddNewLeadModal';
import { leadsAPI, companiesAPI } from '../../services/api';

const LeadsPage = () => {
  const navigate = useNavigate();
  const [leads, setLeads] = useState(leadsData.leads);
  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');

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
            name: lead.lead_name || (lead.first_name && lead.last_name
              ? `${lead.first_name} ${lead.last_name}`
              : lead.name || 'Unknown'),
            email: lead.email || '',
            phone: lead.phone || '',
            company: lead.company_name || lead.company || '',
            source: lead.lead_source || lead.source || 'Website',
            status: lead.lead_status || lead.status || 'New',
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
          ...formData,
          ...response,
          id: response.id,
          name: response.lead_name || formData.name || 'New Lead',
          email: response.email || formData.email || '',
          phone: response.phone || formData.phone || '',
          company: response.company || formData.company || '',
          lead_source: response.lead_source || formData.source || 'Website',
          source: response.lead_source || formData.source || 'Website',
          lead_status: response.lead_status || formData.status || 'New',
          status: response.lead_status || formData.status || 'New',
          rating: response.rating || formData.rating || 5,
          value: response.value || formData.value || null,
          currency: response.currency || formData.currency || 'USD',
          lead_type: response.lead_type || formData.lead_type || null,
          industry: response.industry || formData.industry || null,
          visibility: response.visibility || formData.visibility || 'Public',
          tags: response.tags || formData.tags || [],
          people_assigned: response.people_assigned || formData.people_assigned || [],
          owner_id: response.owner_id || formData.owner_id || null
        };

        setLeads(prev => [newLead, ...prev]);
        setIsModalOpen(false);
      }
    } catch (err) {
      throw new Error(err.message || 'Failed to create lead');
    }
  };

  const handleCompanyAdded = async (newCompany) => {
    const companiesRes = await companiesAPI.getAll();
    if (companiesRes && Array.isArray(companiesRes)) {
      setCompanies(companiesRes);
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

  const getFilteredLeads = () => {
    if (selectedStatus === 'All') return leads;
    return leads.filter(lead => (lead.status || lead.lead_status) === selectedStatus);
  };

  const columns = [
    {
      key: 'project_name',
      label: 'Project Name',
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col">
          <button
            onClick={() => navigate(`/lead/${row.id}`)}
            className="text-left text-[#1F2020] hover:text-red-600 font-[500] transition text-sm"
          >
            {value || 'No Project Name'}
          </button>
          <span className="text-xs text-gray-500 ">{row.name || row.lead_name}</span>
        </div>
      )
    },
    {
      key: 'business_type',
      label: 'Business Type',
      sortable: true,
      render: (value) => <span className="text-xs text-gray-600">{value || 'N/A'}</span>
    },
    {
      key: 'created_at',
      label: 'Generate Date',
      sortable: true,
      render: (value) => (
        <span className="text-xs text-gray-600">
          {value ? new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
        </span>
      )
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (value) => <a href={`mailto:${value}`} className="text-gray-600 hover:text-red  text-xs ">{value}</a>
    },
    {
      key: 'phone',
      label: 'Phone',
      sortable: false,
      render: (value) => <span className="text-xs  text-gray-600">{value || '-'}</span>
    },
    {
      key: 'company',
      label: 'Company',
      sortable: true,
      render: (value) => <span className="text-xs  text-gray-600">{value || '-'}</span>
    },
    {
      key: 'source',
      label: 'Source',
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs   bg-blue-100 text-blue-800 w-fit">
            {value}
          </span>
          {(row.referral_name || row.referral_contact) && (
            <div className="text-xs text-orange-600 flex flex-col">
              {row.referral_name && <span>Ref: {row.referral_name}</span>}
              {row.referral_contact && <span className="text-gray-400">{row.referral_contact}</span>}
            </div>
          )}
        </div>
      )
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
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs   ${getStatusBadge(value)}`}>
          {value}
        </span>
      )
    }
  ];

  const filteredLeads = getFilteredLeads();

  return (
    <div className="p-2 bg-[#F7F8F9] min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[1.250025rem]  text-gray-900">Leads</h1>
          <p className="text-gray-600 text-xs ">Manage all your sales leads</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 text-white p-2  rounded    flex items-center gap-2 hover:bg-red-700 transition text-xs ">
          <Plus size={16} /> Add New Lead
        </button>
      </div>

      <div className="mb-6 bg-white rounded  shadow p-2">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={18} className="text-gray-600" />
          <span className="text-xs    text-gray-700">Filter by Status:</span>
          {['All', 'New', 'Contacted', 'Qualified', 'Unqualified'].map(status => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded  text-xs    transition ${selectedStatus === status
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {status}
              {status !== 'All' && (
                <span className="ml-2 text-xs">
                  ({leads.filter(l => (l.status || l.lead_status) === status).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredLeads}
        title={selectedStatus === 'All' ? 'All Leads' : `${selectedStatus} Leads`}
        searchKeys={['name', 'email', 'company']}
      />

      <AddNewLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLead}
        companies={companies}
        onCompanyAdded={handleCompanyAdded}
      />
    </div>
  );
};

export default LeadsPage;
