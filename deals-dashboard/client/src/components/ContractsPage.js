import React, { useState } from 'react';
import { MoreVertical, Plus, Download, Grid3x3, List } from 'lucide-react';

const ContractsPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [contracts] = useState([
    {
      id: '274729',
      title: 'SEO Contracts',
      category: 'Contracts under Seal',
      date: '23 Nov 2025',
      openTill: '17 Dec 2025',
      company: 'NovaWave LLC',
      value: '$2,04,214',
      avatar: '🟦'
    },
    {
      id: '274730',
      title: 'Web Design',
      category: 'Executory Contracts',
      date: '07 Nov 2025',
      openTill: '11 Dec 2025',
      company: 'BlueSky Industries',
      value: '$1,45,000',
      avatar: '🟧'
    },
    {
      id: '274731',
      title: 'Logo & Branding',
      category: 'Express Contracts',
      date: '15 Oct 2025',
      openTill: '23 Nov 2025',
      company: 'Silver Hawk',
      value: '$2,51,000',
      avatar: '🟩'
    },
    {
      id: '274732',
      title: 'Development',
      category: 'Implied Contracts',
      date: '28 Sep 2025',
      openTill: '12 Nov 2025',
      company: 'Summit Peak',
      value: '$4,80,380',
      avatar: '🟦'
    },
    {
      id: '274733',
      title: 'Business Card Design',
      category: 'Unconscionable',
      date: '25 Sep 2025',
      openTill: '07 Nov 2025',
      company: 'RiverStone Ltd',
      value: '$4,80,380',
      avatar: '🟧'
    },
    {
      id: '274734',
      title: 'Technical SEO',
      category: 'Fixed Price Contract',
      date: '12 Sep 2025',
      openTill: '27 Oct 2025',
      company: 'Bright Bridge Grp',
      value: '$3,50,000',
      avatar: '🟦'
    },
    {
      id: '274735',
      title: 'Social Media profile Branding',
      category: 'Cost Plus Contract',
      date: '17 Aug 2025',
      openTill: '15 Oct 2025',
      company: 'CoastalStar Co.',
      value: '$1,23,000',
      avatar: '🟨'
    },
    {
      id: '274736',
      title: 'Portfolio Site',
      category: 'Service Level Agreement',
      date: '11 Jun 2025',
      openTill: '04 Oct 2025',
      company: 'HarborView',
      value: '$3,12,500',
      avatar: '⚫'
    },
    {
      id: '274737',
      title: 'Logo Design',
      category: 'Partnership Contract',
      date: '11 Mar 2025',
      openTill: '29 Sep 2025',
      company: 'Golden Gate Ltd',
      value: '$4,18,000',
      avatar: '🟧'
    },
    {
      id: '274738',
      title: 'Web Design',
      category: 'Executory Contracts',
      date: '27 Jan 2025',
      openTill: '25 Sep 2025',
      company: 'BlueSky Industries',
      value: '$1,45,000',
      avatar: '🟦'
    },
    {
      id: '274739',
      title: 'HarborView',
      category: 'Implied Contracts',
      date: '17 Dec 2025',
      openTill: '18 Oct 2026',
      company: 'RiverStone Ltd',
      value: '$4,18,000',
      avatar: '🟨'
    },
    {
      id: '274740',
      title: 'Business Card Design',
      category: 'Partnership Contract',
      date: '18 Dec 2025',
      openTill: '19 Oct 2026',
      company: 'RiverStone Ltd',
      value: '$4,80,380',
      avatar: '⚫'
    }
  ]);

  const ContractCard = ({ contract }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
          {contract.id}
        </span>
        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
          <MoreVertical size={18} className="text-gray-400" />
        </button>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1">{contract.title}</h3>
      <p className="text-xs text-gray-500 mb-3">Category : {contract.category}</p>

      <div className="space-y-2 mb-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>Date : {contract.date}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>⏳</span>
          <span>Open till : {contract.openTill}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-lg">
          {contract.avatar}
        </div>
        <div className="text-xs">
          <p className="font-medium text-gray-900">{contract.company}</p>
          <p className="text-gray-500">Customer</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded font-medium flex items-center gap-1">
          💰 Value: {contract.value}
        </span>
        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
          <Download size={16} className="text-gray-400" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts <span className="text-red-600 text-sm bg-red-100 px-2 py-1 rounded ml-2">125</span></h1>
          <p className="text-sm text-gray-500 mt-1">Home / Contracts</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="border border-gray-300 px-3 py-2 rounded-md text-sm bg-white hover:bg-gray-50 transition-colors flex items-center gap-2">
            🔄 Export
          </button>
          <button className="border border-gray-300 px-3 py-2 rounded-md text-sm bg-white hover:bg-gray-50 transition-colors">
            ⋮
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
            Add New Contract
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white px-6 py-4 border-b flex items-center gap-3">
        <button className="border border-gray-300 px-3 py-2 rounded-md text-sm bg-white hover:bg-gray-50 transition-colors flex items-center gap-2">
          ⚙️ Filter
        </button>
        <div className="flex-1 max-w-md">
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
            {contracts.map((contract, idx) => (
              <ContractCard key={idx} contract={contract} />
            ))}
          </div>
        )}

        {/* Load More Button */}
        <div className="flex justify-center">
          <button className="bg-red-600 text-white px-8 py-2 rounded-md font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
            Load More
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

export default ContractsPage;
