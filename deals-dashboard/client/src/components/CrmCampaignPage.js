import React, { useState } from 'react';
import { Search, ChevronDown, Filter, Plus, MoreVertical } from 'lucide-react';
import campaignData from '../data/crmCampaignData.json';

const CrmCampaignPage = () => {
  const [stats] = useState(campaignData.stats);
  const [campaigns] = useState(campaignData.campaigns);
  const [activeTab, setActiveTab] = useState('Active Campaign');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-600';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-600';
      case 'Bounced':
        return 'bg-red-100 text-red-600';
      case 'Running':
        return 'bg-blue-100 text-blue-600';
      case 'Paused':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatIcon = (label) => {
    switch (label) {
      case 'Campaign':
        return <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xl">📧</div>;
      case 'Sent':
        return <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">📮</div>;
      case 'Opened':
        return <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white text-xl">📂</div>;
      case 'Completed':
        return <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">✓</div>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen flex flex-col">
      <div className="px-6 pt-6 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold text-red-600">Campaign</h1>
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm font-bold">125</span>
            </div>
            <div className="flex items-center gap-1 text-sm mt-1">
              <button className="text-orange-500 hover:text-orange-600 font-medium bg-transparent border-none cursor-pointer p-0">Home</button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600">Campaign</span>
            </div>
          </div>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition text-sm">
            <Plus size={16} /> Add New Campaign
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200 flex items-center gap-4">
              {getStatIcon(stat.label)}
              <div>
                <p className="text-xs text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-green-600 font-semibold">{stat.change}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 flex flex-col">
        <div className="flex items-center gap-6 mb-4 border-b border-gray-200 pb-3">
          {['Active Campaign', 'Completed Campaign', 'Archived Campaign'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-semibold transition-colors pb-1 ${
                activeTab === tab
                  ? 'text-red-600 border-b-2 border-red-600 -mb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
              {tab === 'Active Campaign' && <span className="text-red-600 ml-2">24</span>}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm bg-white"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition bg-white flex items-center gap-2">
            <Filter size={16} /> Sort By <ChevronDown size={14} />
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition bg-white flex items-center gap-2">
            <Filter size={16} /> Filter
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition bg-white">
            Manage Columns
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left w-8">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Progress</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Members</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaigns.map((campaign, idx) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{campaign.name}</td>
                    <td className="px-4 py-3 text-gray-600">{campaign.type}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-6 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-900">{campaign.progress.opened.toFixed(1)}%</span>
                          <span className="text-gray-500">Opened</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-900">{campaign.progress.closed.toFixed(1)}%</span>
                          <span className="text-gray-500">Closed</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-900">{campaign.progress.unsubscribe.toFixed(1)}%</span>
                          <span className="text-gray-500">Unsubscribe</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-900">{campaign.progress.delivered.toFixed(1)}%</span>
                          <span className="text-gray-500">Delivered</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-gray-900">{campaign.progress.conversation.toFixed(1)}%</span>
                          <span className="text-gray-500">Conversation</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex -space-x-2">
                        {[...Array(Math.min(campaign.members, 3))].map((_, i) => (
                          <img
                            key={i}
                            src={`https://i.pravatar.cc/40?img=${idx * 3 + i}`}
                            alt="member"
                            className="w-7 h-7 rounded-full border-2 border-white"
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${getStatusBadgeColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded transition">
                        <MoreVertical size={16} strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Show</span>
              <select className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>
              <span>entries</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-100 transition text-gray-600">−</button>
              <button className="w-8 h-8 bg-red-600 text-white rounded font-semibold text-sm">1</button>
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-100 transition text-gray-600">+</button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-white text-center">
        <p className="text-xs text-gray-500">Copyright © 2025 <span className="text-red-600 font-semibold">Preadmin</span></p>
      </div>
    </div>
  );
};

export default CrmCampaignPage;
