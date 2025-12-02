import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Plus, MoreVertical } from 'lucide-react';
import leadsData from '../data/crmLeadsData.json';
import AddNewLeadModal from './AddNewLeadModal';
import { leadsAPI, companiesAPI } from '../services/api';

const CrmLeadsPage = () => {
  const [leads, setLeads] = useState(leadsData.leads);
  const [statusStats, setStatusStats] = useState(leadsData.statusStats);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, companiesRes] = await Promise.all([
          leadsAPI.getAll(),
          companiesAPI.getAll(),
        ]);

        if (leadsRes && Array.isArray(leadsRes)) {
          const formattedLeads = leadsRes.map(lead => {
            const displayName = lead.name || (lead.first_name && lead.last_name 
              ? `${lead.first_name} ${lead.last_name}` 
              : 'Unknown');
            const initials = displayName
              .split(' ')
              .slice(0, 2)
              .map(n => n[0])
              .join('')
              .toUpperCase() || 'N/A';
            
            return {
              id: lead.id,
              name: displayName,
              email: lead.email || '',
              phone: lead.phone || '',
              company: lead.company || lead.company_name || '',
              source: lead.source || 'Website',
              status: lead.status || 'Not Contacted',
              rating: lead.rating || 5,
              initials: initials,
              value: (lead.value || 0) * 100000,
              location: lead.location || '',
              ...lead
            };
          });
          setLeads(formattedLeads);

          const uniqueStatuses = [...new Set(formattedLeads.map(l => l.status))];
          const newStatusStats = uniqueStatuses.map(status => {
            const statusLeads = formattedLeads.filter(l => l.status === status);
            return {
              status,
              leads: statusLeads.length,
              value: statusLeads.reduce((sum, l) => sum + (l.value || 0), 0)
            };
          });
          setStatusStats(newStatusStats);
        }

        if (companiesRes && Array.isArray(companiesRes)) {
          setCompanies(companiesRes);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setLeads(leadsData.leads);
        setStatusStats(leadsData.statusStats);
      }
    };

    fetchData();
  }, []);

  const handleCreateLead = async (formData) => {
    try {
      const response = await leadsAPI.create(formData);
      
      if (response.id) {
        const displayName = formData.name || 'New Lead';
        const initials = displayName
          .split(' ')
          .slice(0, 2)
          .map(n => n[0])
          .join('')
          .toUpperCase() || 'N/A';
        
        const newLead = {
          id: response.id,
          name: displayName,
          email: formData.email || '',
          phone: formData.phone || '',
          company: formData.company || '',
          source: formData.source || 'Website',
          status: formData.status || 'Not Contacted',
          rating: formData.rating || 5,
          initials: initials,
          value: parseInt(formData.value || 0) * 100000,
          location: formData.location || '',
          ...formData
        };
        
        setLeads(prev => [newLead, ...prev]);
        
        const existingStatusIndex = statusStats.findIndex(s => s.status === newLead.status);
        if (existingStatusIndex >= 0) {
          setStatusStats(prev => {
            const updated = [...prev];
            updated[existingStatusIndex].leads += 1;
            updated[existingStatusIndex].value += newLead.value;
            return updated;
          });
        } else {
          setStatusStats(prev => [...prev, {
            status: newLead.status,
            leads: 1,
            value: newLead.value
          }]);
        }
        
        setIsModalOpen(false);
      }
    } catch (err) {
      throw new Error(err.message || 'Failed to create lead');
    }
  };

  const formatCurrency = (value) => {
    return `$${(value / 100000).toFixed(2).replace('.', ',')}`;
  };

  const statusColors = {
    'Contacted': { hex: '#F59E0B', rgb: 'rgb(245, 158, 11)', dot: 'bg-yellow-400', light: 'bg-yellow-50' },
    'Not Contacted': { hex: '#3B82F6', rgb: 'rgb(59, 130, 246)', dot: 'bg-blue-400', light: 'bg-blue-50' },
    'Closed': { hex: '#10B981', rgb: 'rgb(16, 185, 129)', dot: 'bg-green-400', light: 'bg-green-50' },
    'Lost': { hex: '#EF4444', rgb: 'rgb(239, 68, 68)', dot: 'bg-red-400', light: 'bg-red-50' }
  };

  const getInitialColor = (status) => {
    const colors = {
      'Contacted': '#F59E0B',
      'Not Contacted': '#3B82F6',
      'Closed': '#10B981',
      'Lost': '#EF4444'
    };
    return colors[status] || '#3B82F6';
  };

  const groupedLeads = statusStats.map(stat => ({
    ...stat,
    leads: leads.filter(l => l.status === stat.status)
  }));

  return (
    <div className="w-full bg-gray-50 min-h-screen flex flex-col">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[28px] font-bold text-gray-900">Leads</h1>
              <span className="bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-[12px] font-bold">123</span>
            </div>
            <div className="flex items-center gap-1 text-[13px] mt-1">
              <button className="text-orange-500 hover:text-orange-600 font-medium bg-transparent border-none cursor-pointer p-0">Home</button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600">Leads</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-[13px] font-medium text-gray-700 transition bg-white flex items-center gap-2">
              Export
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-teal-600 transition text-[13px]">
              Add Lead
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-[13px] bg-white"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-[13px] font-medium text-gray-700 transition bg-white flex items-center gap-2">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 pb-0 relative overflow-hidden">
        <div className="relative group h-full">
          <div
            ref={scrollRef}
            className="flex gap-4 h-full overflow-x-auto overflow-y-auto pr-2 pb-4"
          >
            {groupedLeads.map((group) => {
              const colors = statusColors[group.status] || statusColors['Not Contacted'];
              return (
                <div key={group.status} className="flex-shrink-0 w-96">
                  <div className="bg-white rounded-lg overflow-hidden border border-gray-200 h-full flex flex-col">
                    <div 
                      className="h-1 w-full" 
                      style={{ backgroundColor: colors.hex }}
                    ></div>

                    <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2.5 h-2.5 rounded-full" 
                            style={{ backgroundColor: colors.hex }}
                          ></div>
                          <h2 className="text-[14px] font-bold text-gray-900">{group.status}</h2>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="text-gray-400 hover:bg-gray-100 p-1 rounded transition">
                            <Plus size={16} strokeWidth={2} />
                          </button>
                          <button className="text-gray-400 hover:bg-gray-100 p-1 rounded transition">
                            <MoreVertical size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[12px] text-gray-600">{group.leads.length} Leads - {formatCurrency(group.value)}</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {group.leads.map((lead) => (
                        <div
                          key={lead.id}
                          className="bg-gray-50 rounded-lg border border-gray-200 p-3.5 hover:shadow-md transition-shadow hover:-translate-y-0.5 flex-shrink-0"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs"
                              style={{ backgroundColor: getInitialColor(group.status) }}
                            >
                              {lead.initials}
                            </div>
                            <button className="text-gray-400 hover:bg-gray-200 p-0.5 rounded transition">
                              <MoreVertical size={14} strokeWidth={1.5} />
                            </button>
                          </div>

                          <h3 className="text-[13px] font-semibold text-gray-900 mb-2 line-clamp-2">{lead.name}</h3>

                          <div className="space-y-1 mb-3 text-[12px]">
                            <div className="flex items-center gap-1.5">
                              <span>💰</span>
                              <span className="font-semibold text-gray-900">{formatCurrency(lead.value)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span>✉️</span>
                              <span className="text-gray-600 truncate text-[11px]">{lead.email}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span>📞</span>
                              <span className="text-gray-600 text-[11px]">{lead.phone}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span>📍</span>
                              <span className="text-gray-600 text-[11px]">{lead.location}</span>
                            </div>
                          </div>

                          <div className="border-t border-gray-200 pt-2.5">
                            <div className="flex items-center justify-between text-[11px]">
                              <div className="flex gap-2">
                                <button className="text-gray-400 hover:text-gray-600 transition">📧</button>
                                <button className="text-gray-400 hover:text-gray-600 transition">📞</button>
                                <button className="text-gray-400 hover:text-gray-600 transition">💬</button>
                              </div>
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ backgroundColor: colors.hex }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-white text-center">
        <p className="text-[12px] text-gray-500 font-medium">Copyright © 2025 <span className="text-red-600 font-semibold">Preadmin</span></p>
      </div>

      <AddNewLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLead}
        companies={companies}
      />
    </div>
  );
};

export default CrmLeadsPage;
