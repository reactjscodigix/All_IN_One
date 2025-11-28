import React, { useState } from 'react';
import { MoreVertical, Plus, Grid3x3, List } from 'lucide-react';

const ProposalsPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [proposals] = useState([
    {
      id: '#1493016',
      title: 'SEO Proposal',
      project: 'Truelysell',
      value: '$2,04,214',
      date: '25 May 2024',
      openTill: '31 Jun 2024',
      status: 'Accepted',
      company: 'NovaWave LLC',
      avatar: '🌊'
    },
    {
      id: '#1493016',
      title: 'SEO Proposal',
      project: 'Truelysell',
      value: '$2,04,214',
      date: '25 May 2024',
      openTill: '31 Jun 2024',
      status: 'Deleted',
      company: 'Redwood Inc',
      avatar: '🌲'
    },
    {
      id: '#1493016',
      title: 'SEO Proposal',
      project: 'Truelysell',
      value: '$2,04,214',
      date: '25 May 2024',
      openTill: '31 Jun 2024',
      status: 'Draft',
      company: 'HarborView',
      avatar: '⚓'
    },
    {
      id: '#1493016',
      title: 'SEO Proposal',
      project: 'Truelysell',
      value: '$2,04,214',
      date: '25 May 2024',
      openTill: '31 Jun 2024',
      status: 'Declined',
      company: 'CoastalStar Co.',
      avatar: '⭐'
    },
    {
      id: '#1493016',
      title: 'SEO Proposal',
      project: 'Truelysell',
      value: '$2,04,214',
      date: '25 May 2024',
      openTill: '31 Jun 2024',
      status: 'Declined',
      company: 'Summit Peak',
      avatar: '⛰️'
    },
    {
      id: '#1493016',
      title: 'SEO Proposal',
      project: 'Truelysell',
      value: '$2,04,214',
      date: '25 May 2024',
      openTill: '31 Jun 2024',
      status: 'Sent',
      company: 'Silver Hawk',
      avatar: '🦅'
    },
    {
      id: '#1493016',
      title: 'SEO Proposal',
      project: 'Truelysell',
      value: '$2,04,214',
      date: '25 May 2024',
      openTill: '31 Jun 2024',
      status: 'Deleted',
      company: 'BlueSky Industries',
      avatar: '☁️'
    },
    {
      id: '#1493016',
      title: 'SEO Proposal',
      project: 'Truelysell',
      value: '$2,04,214',
      date: '25 May 2024',
      openTill: '31 Jun 2024',
      status: 'Draft',
      company: 'NovaWave LLC',
      avatar: '🌊'
    }
  ]);

  const getStatusColor = (status) => {
    const colors = {
      'Accepted': 'bg-green-100 text-green-700',
      'Deleted': 'bg-red-100 text-red-700',
      'Draft': 'bg-blue-100 text-blue-700',
      'Declined': 'bg-yellow-100 text-yellow-700',
      'Sent': 'bg-teal-100 text-teal-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const ProposalCard = ({ proposal }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
          {proposal.id}
        </span>
        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
          <MoreVertical size={18} className="text-gray-400" />
        </button>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1">{proposal.title}</h3>
      <p className="text-xs text-gray-500 mb-3">Project : {proposal.project}</p>

      <div className="space-y-2 mb-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span>💰</span>
          <span>Total Value : {proposal.value}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>Date : {proposal.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>⏳</span>
          <span>Open till : {proposal.openTill}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg">
          {proposal.avatar}
        </div>
        <div className="text-xs">
          <p className="text-gray-500">Sent to</p>
          <p className="font-medium text-gray-900">{proposal.company}</p>
        </div>
      </div>

      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(proposal.status)}`}>
        {proposal.status}
      </span>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proposals <span className="text-red-600 text-sm bg-red-100 px-2 py-1 rounded ml-2">125</span></h1>
          <p className="text-sm text-gray-500 mt-1">Home / Proposals</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="border border-gray-300 px-3 py-2 rounded-md text-sm bg-white hover:bg-gray-50 transition-colors">⚙ Filter</button>
          <button className="border border-gray-300 px-3 py-2 rounded-md text-sm bg-white hover:bg-gray-50 transition-colors flex items-center gap-2">
            🔄 Export
          </button>
          <div className="flex items-center gap-2 border border-gray-300 rounded-md bg-white p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-green-100 text-green-700' : 'hover:bg-gray-100'}`}
            >
              <List size={18} />
            </button>
          </div>
          <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
            <Plus size={18} />
            Add New Proposal
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-6 py-4 border-b">
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search"
            className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {proposals.map((proposal, idx) => (
              <ProposalCard key={idx} proposal={proposal} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        <div className="flex justify-center">
          <button className="bg-red-600 text-white px-8 py-2 rounded-md font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
            💫 Load More
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-400 py-6 border-t mt-8">
        Copyright © 2025 <span className="text-red-600 font-medium">Preadmin</span>
      </div>
    </div>
  );
};

export default ProposalsPage;
