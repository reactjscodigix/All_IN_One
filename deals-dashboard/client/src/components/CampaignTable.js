import React, { useState } from 'react';
import { Plus, MoreVertical } from 'lucide-react';
import campaignData from '../data/campaignTableData.json';

const CampaignTable = () => {
  const [campaigns] = useState(campaignData.campaigns);
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="w-full bg-gray-50">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[28px] font-bold text-gray-900">Campaign</h1>
              <span className="bg-[#FFE5E5] text-[#F62416] px-2.5 py-0.5 rounded-full text-[12px] font-bold">125</span>
            </div>
            <div className="flex items-center gap-1 text-[13px] mt-1">
              <button className="text-[#F97316] hover:text-[#EA580C] font-medium bg-transparent border-none cursor-pointer p-0">Home</button>
              <span className="text-[#D1D5DB]">&gt;</span>
              <span className="text-[#6B7280]">Campaign</span>
            </div>
          </div>
          <button className="bg-[#F62416] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition text-[13px]">
            <Plus size={18} />
            Add New Campaign
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <input type="text" placeholder="Search" className="w-full max-w-xs px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none text-[13px] bg-white" />
          </div>
          <button className="px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 text-[13px] font-medium text-gray-700 transition bg-white">Filter</button>
        </div>

        <div className="flex items-center gap-8 border-b border-[#EAECF0]">
          <button onClick={() => setActiveTab('active')} className={`pb-3 text-[14px] font-medium transition ${activeTab === 'active' ? 'text-[#F62416] border-b-2 border-[#F62416]' : 'text-[#6B7280]'}`}>
            Active Campaign 24
          </button>
          <button onClick={() => setActiveTab('completed')} className={`pb-3 text-[14px] font-medium transition ${activeTab === 'completed' ? 'text-[#F62416] border-b-2 border-[#F62416]' : 'text-[#6B7280]'}`}>
            Completed Campaign
          </button>
          <button onClick={() => setActiveTab('archived')} className={`pb-3 text-[14px] font-medium transition ${activeTab === 'archived' ? 'text-[#F62416] border-b-2 border-[#F62416]' : 'text-[#6B7280]'}`}>
            Archived Campaign
          </button>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="overflow-x-auto bg-white border border-[#EAECF0] rounded-[12px] shadow-[0_2px_6px_rgba(0,0,0,0.05)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#EAECF0]">
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#6B7280]">Name</th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#6B7280]">Type</th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#6B7280]">Progress</th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#6B7280]">Members</th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#6B7280]">Status</th>
                <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#6B7280]">Action</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-[#EAECF0] hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-[13px] font-medium text-gray-900">{campaign.name}</p>
                      <p className="text-[12px] text-[#6B7280]">{campaign.type}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-gray-900">{campaign.type}</td>
                  <td className="px-6 py-4">
                    <div className="space-y-1 text-[11px]">
                      {campaign.progress.map((prog, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span style={{ color: prog.bg }} className="font-semibold">{prog.value}</span>
                          <span className="text-[#9CA3AF]">{prog.label}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-300 to-gray-400"></div>
                      ))}
                      <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-gray-700">3+</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-md text-[12px] font-medium text-white`} style={{ backgroundColor: campaign.statusBg }}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-[#9CA3AF] hover:bg-gray-100 p-1 rounded"><MoreVertical size={16} strokeWidth={2} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center gap-2 mt-6">
          <button className="px-3 py-2 border border-[#EAECF0] rounded-lg hover:bg-gray-50 text-[12px] text-gray-700">←</button>
          <button className="px-3 py-2 bg-[#F62416] text-white rounded-lg text-[12px] font-medium">1</button>
          <button className="px-3 py-2 border border-[#EAECF0] rounded-lg hover:bg-gray-50 text-[12px] text-gray-700">→</button>
        </div>
      </div>
    </div>
  );
};

export default CampaignTable;
