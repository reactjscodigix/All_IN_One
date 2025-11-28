import React, { useState } from 'react';
import { Mail, Phone, MapPin, Plus, MoreVertical } from 'lucide-react';
import leadsData from '../data/leadsKanbanData.json';

const LeadsKanban = () => {
  const [columns] = useState(leadsData.columns);

  return (
    <div className="w-full bg-gray-50">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[28px] font-bold text-gray-900">Leads</h1>
              <span className="bg-[#FFE5E5] text-[#F62416] px-2.5 py-0.5 rounded-full text-[12px] font-bold">123</span>
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
                  <p className="text-[12px] text-[#6B7280]">{column.count} Leads - {column.value}</p>
                </div>
                <button className="text-[#9CA3AF] hover:bg-gray-100 p-1 rounded"><Plus size={16} /></button>
              </div>

              <div className="space-y-3">
                {column.leads.map((lead) => (
                  <div key={lead.id} className="bg-white border border-[#EAECF0] rounded-[12px] shadow-[0_2px_6px_rgba(0,0,0,0.05)] p-4">
                    <div className="w-full h-1 rounded-full" style={{ backgroundColor: column.color }} className="mb-3"></div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded font-bold text-white text-[11px] flex items-center justify-center ${lead.icon}`}>{lead.initials}</div>
                      <h3 className="text-[14px] font-semibold text-gray-900">{lead.name}</h3>
                    </div>

                    <p className="text-[13px] font-semibold text-gray-900 mb-2">{lead.value}</p>

                    <div className="space-y-1 mb-3 text-[12px] text-[#6B7280]">
                      <div className="flex items-center gap-2"><Mail size={13} />{lead.email}</div>
                      <div className="flex items-center gap-2"><Phone size={13} />{lead.phone}</div>
                      <div className="flex items-center gap-2"><MapPin size={13} />{lead.location}</div>
                    </div>

                    <div className="flex items-center gap-4 pt-2 text-[#6B7280]">
                      <button className="hover:text-gray-900 p-0.5"><Mail size={13} strokeWidth={1.5} /></button>
                      <button className="hover:text-gray-900 p-0.5"><Phone size={13} strokeWidth={1.5} /></button>
                      <button className="hover:text-gray-900 p-0.5"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01" /></svg></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeadsKanban;
