import React, { useState } from 'react';
import { Download, Plus, MoreVertical } from 'lucide-react';

const EstimationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    { id: 'draft', name: 'Draft', color: '#FDB022' },
    { id: 'sent', name: 'Sent', color: '#3B82F6' },
    { id: 'accepted', name: 'Accepted', color: '#10B981' },
    { id: 'declined', name: 'Declined', color: '#EF4444' },
  ];

  const estimations = [
    {
      id: 1,
      company: 'Truelysell',
      type: 'Mobile App',
      desc: 'TruelySell provides a multiple on-demand service based bootstrap html template.',
      estimateId: '#EST00020',
      amount: '$01,23,000',
      date: '15 Oct 2023',
      expiry: '05 Nov 2026',
      owner: 'Dawn Mercha',
      column: 'draft',
      avatar: 'T',
    },
    {
      id: 2,
      company: 'Kofejob',
      type: 'Meeting',
      desc: 'TruelySell provides a multiple on-demand service based bootstrap html template.',
      estimateId: '#EST00020',
      amount: '$01,23,000',
      date: '15 Oct 2023',
      expiry: '05 Nov 2026',
      owner: 'Darlee Robertson',
      column: 'draft',
      avatar: 'K',
    },
    {
      id: 3,
      company: 'Truelysell',
      type: 'Web App',
      desc: 'TruelySell provides a multiple on-demand service based bootstrap html template.',
      estimateId: '#EST00020',
      amount: '$01,23,000',
      date: '15 Oct 2023',
      expiry: '05 Nov 2026',
      owner: 'Darlee Robertson',
      column: 'sent',
      avatar: 'T',
    },
    {
      id: 4,
      company: 'Doccure',
      type: 'Meeting',
      desc: 'TruelySell provides a multiple on-demand service based bootstrap html template.',
      estimateId: '#EST00020',
      amount: '$01,23,000',
      date: '15 Oct 2023',
      expiry: '05 Nov 2026',
      owner: 'Rachel Hampton',
      column: 'sent',
      avatar: 'D',
    },
    {
      id: 5,
      company: 'Dreamschat',
      type: 'Meeting',
      desc: 'TruelySell provides a multiple on-demand service based bootstrap html template.',
      estimateId: '#EST00020',
      amount: '$01,23,000',
      date: '15 Oct 2023',
      expiry: '05 Nov 2026',
      owner: 'Sharon Roy',
      column: 'accepted',
      avatar: 'D',
    },
    {
      id: 6,
      company: 'servbook',
      type: 'Meeting',
      desc: 'TruelySell provides a multiple on-demand service based bootstrap html template.',
      estimateId: '#EST00020',
      amount: '$01,23,000',
      date: '15 Oct 2023',
      expiry: '05 Nov 2026',
      owner: 'Jessica Louise',
      column: 'accepted',
      avatar: 'S',
    },
    {
      id: 7,
      company: 'DreamPOS',
      type: 'Web App',
      desc: 'TruelySell provides a multiple on-demand service based bootstrap html template.',
      estimateId: '#EST00020',
      amount: '$01,23,000',
      date: '15 Oct 2023',
      expiry: '05 Nov 2026',
      owner: 'Carol Thomas',
      column: 'declined',
      avatar: 'D',
    },
    {
      id: 8,
      company: 'Dreamsports',
      type: 'Meeting',
      desc: 'TruelySell provides a multiple on-demand service based bootstrap html template.',
      estimateId: '#EST00020',
      amount: '$01,23,000',
      date: '15 Oct 2023',
      expiry: '05 Nov 2026',
      owner: 'Jonathan Smith',
      column: 'declined',
      avatar: 'D',
    },
  ];

  const EstimationCard = ({ item }) => (
    <div className="border border-gray-200 rounded-xl p-5 mb-4 bg-white shadow-sm hover:shadow-lg transition-all duration-300 cursor-move">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-base text-gray-900">{item.company}</h3>
          <p className="text-xs text-gray-500 font-medium">{item.type}</p>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical size={16} className="text-gray-500" />
        </button>
      </div>
      <p className="text-sm text-gray-600 mt-3 line-clamp-2">{item.desc}</p>
      <div className="mt-4 space-y-2 text-xs text-gray-700 bg-gray-50 rounded-lg p-3">
        <p><span className="font-bold text-gray-900">Estimate ID :</span> <span className="font-semibold text-blue-600">{item.estimateId}</span></p>
        <p><span className="font-bold text-gray-900">Amount :</span> <span className="font-bold text-gray-900">{item.amount}</span></p>
        <p><span className="font-bold text-gray-900">Date :</span> {item.date}</p>
        <p><span className="font-bold text-gray-900">Expiry Date :</span> {item.expiry}</p>
      </div>
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
          {item.owner.charAt(0)}
        </div>
        <p className="text-sm font-semibold text-gray-800">{item.owner}</p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 flex items-center gap-3">
              Estimations 
              <span className="inline-block px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">123</span>
            </h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">Home › Estimations</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search Estimations"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500 w-72"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="px-5 py-2.5 border border-gray-300 rounded-lg flex items-center gap-2 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <Download size={18} />
            Export
          </button>
          <button className="px-5 py-2.5 bg-red-600 text-white rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm">
            <Plus size={18} />
            Add Estimation
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-6 px-8 py-6 pb-20 min-w-max h-full">
          {columns.map((col) => (
            <div key={col.id} className="min-w-[360px] w-[360px] bg-white border border-gray-200 rounded-xl p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow">
              {/* Column Header */}
              <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                <h2 className="flex items-center gap-3 font-bold text-lg text-gray-900">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: col.color }}></span>
                  {col.name}
                </h2>
                <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                  <Plus size={18} className="text-gray-600" />
                </button>
              </div>

              {/* Cards */}
              <div className="space-y-0 flex-1 overflow-y-auto pr-2">
                {estimations
                  .filter((item) => item.column === col.id)
                  .map((item) => (
                    <EstimationCard key={item.id} item={item} />
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Load More Button */}
      <div className="flex justify-center py-8 bg-gray-50 border-t border-gray-200">
        <button className="px-12 py-3 bg-red-600 text-white rounded-lg text-base font-semibold hover:bg-red-700 transition-colors shadow-sm">
          Load More
        </button>
      </div>

      {/* Footer */}
      <div className="py-6 text-center text-sm text-gray-500 bg-white border-t border-gray-200 font-medium">
        Copyright © 2025 <span className="text-red-600 font-bold">Preadmin</span>
      </div>
    </div>
  );
};

export default EstimationsPage;
