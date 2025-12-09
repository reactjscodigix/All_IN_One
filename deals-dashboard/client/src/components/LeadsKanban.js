import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Plus, ChevronDown } from 'lucide-react';
import { leadsAPI } from '../services/api';

const LeadsKanban = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusDropdown, setStatusDropdown] = useState({});

  const statusConfig = {
    'New': { color: '#3B82F6', title: 'New' },
    'Contacted': { color: '#F59E0B', title: 'Contacted' },
    'Qualified': { color: '#10B981', title: 'Qualified' },
    'Unqualified': { color: '#EF4444', title: 'Unqualified' }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const leadsRes = await leadsAPI.getAll();
      
      if (Array.isArray(leadsRes)) {
        setLeads(leadsRes);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await leadsAPI.update(leadId, { status: newStatus, lead_status: newStatus });
      setLeads(prev => 
        prev.map(lead => 
          lead.id === leadId 
            ? { ...lead, status: newStatus, lead_status: newStatus }
            : lead
        )
      );
      setStatusDropdown(prev => ({ ...prev, [leadId]: false }));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update lead status');
    }
  };

  const groupedLeads = {
    'New': leads.filter(l => (l.status || l.lead_status) === 'New'),
    'Contacted': leads.filter(l => (l.status || l.lead_status) === 'Contacted'),
    'Qualified': leads.filter(l => (l.status || l.lead_status) === 'Qualified'),
    'Unqualified': leads.filter(l => (l.status || l.lead_status) === 'Unqualified')
  };

  const columns = Object.entries(groupedLeads).map(([status, leads]) => ({
    id: status,
    title: status,
    color: statusConfig[status]?.color || '#6B7280',
    count: leads.length,
    leads: leads
  }));

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[28px] font-bold text-gray-900">Leads</h1>
              <span className="bg-[#FFE5E5] text-[#F62416] px-2.5 py-0.5 rounded-full text-[12px] font-bold">{leads.length}</span>
            </div>
            <div className="flex items-center gap-1 text-[13px] mt-1">
              <button className="text-[#F97316] hover:text-[#EA580C] font-medium bg-transparent border-none cursor-pointer p-0">Home</button>
              <span className="text-[#D1D5DB]">&gt;</span>
              <span className="text-[#6B7280]">Leads</span>
            </div>
          </div>
          <button className="bg-[#F62416] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition text-[13px]">
            <Plus size={18} />
            Add Lead
          </button>
        </div>

        <div className="flex items-center gap-3">
          <input type="text" placeholder="Search" className="w-full max-w-xs px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none text-[13px] bg-white" />
          <button className="px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 text-[13px] font-medium text-gray-700 transition bg-white">Filter</button>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="grid grid-cols-4 gap-4">
          {columns.map((column) => (
            <div key={column.id}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }}></div>
                    <h2 className="text-[15px] font-semibold text-gray-900">{column.title}</h2>
                  </div>
                  <p className="text-[12px] text-[#6B7280]">{column.count} Leads</p>
                </div>
                <button className="text-[#9CA3AF] hover:bg-gray-100 p-1 rounded"><Plus size={16} /></button>
              </div>

              <div className="space-y-3">
                {column.leads.map((lead) => {
                  return (
                    <div key={lead.id} className="bg-white border border-[#EAECF0] rounded-[12px] shadow-[0_2px_6px_rgba(0,0,0,0.05)] p-4">
                      <div className="w-full h-1 rounded-full" style={{ backgroundColor: column.color }} className="mb-3"></div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded font-bold text-white text-[11px] flex items-center justify-center bg-red-500">
                          {getInitials(lead.first_name || '', lead.last_name || '')}
                        </div>
                        <h3 className="text-[14px] font-semibold text-gray-900">{lead.name || lead.lead_name}</h3>
                      </div>

                      {lead.value && (
                        <p className="text-[13px] font-semibold text-gray-900 mb-2">💰${lead.value}</p>
                      )}

                      <div className="space-y-1 mb-3 text-[12px] text-[#6B7280]">
                        {lead.email && (
                          <div className="flex items-center gap-2">
                            <Mail size={13} />
                            <span className="truncate">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={13} />
                            {lead.phone}
                          </div>
                        )}
                        {lead.company_name && (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">🏢</span>
                              <span>{lead.company_name}</span>
                            </div>
                            {lead.address && (
                              <div className="flex items-center gap-2">
                                <MapPin size={13} />
                                <span className="truncate">{lead.address}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="relative">
                        <button
                          onClick={() => setStatusDropdown(prev => ({ ...prev, [lead.id]: !prev[lead.id] }))}
                          className="w-full flex items-center justify-between px-2 py-1.5 text-[12px] font-medium rounded border border-gray-200 hover:bg-gray-50 transition"
                          style={{ color: column.color, borderColor: column.color }}
                        >
                          <span>{lead.status || lead.lead_status || 'New'}</span>
                          <ChevronDown size={14} />
                        </button>

                        {statusDropdown[lead.id] && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                            {Object.entries(statusConfig).map(([status, config]) => (
                              <button
                                key={status}
                                onClick={() => handleStatusChange(lead.id, status)}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                              >
                                <span style={{ color: config.color }} className="font-medium">●</span> {status}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-4 pt-2 mt-2 text-[#6B7280]">
                        <button className="hover:text-gray-900 p-0.5" title="Email"><Mail size={13} strokeWidth={1.5} /></button>
                        <button className="hover:text-gray-900 p-0.5" title="Call"><Phone size={13} strokeWidth={1.5} /></button>
                        <button className="hover:text-gray-900 p-0.5" title="More"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01" /></svg></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadsKanban;
