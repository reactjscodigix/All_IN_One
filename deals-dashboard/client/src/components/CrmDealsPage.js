import React, { useState, useRef } from 'react';
import { Search, Filter, Download, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import dealsData from '../data/crmDealsData.json';

const CrmDealsPage = () => {
  const [deals] = useState(dealsData.deals);
  const [stageStats] = useState(dealsData.stageStats);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollRef = useRef(null);

  const formatCurrency = (value) => {
    const formatted = (value / 100000).toFixed(2);
    return `$${formatted.replace('.', ',')}`;
  };

  const getProgressColor = (progress) => {
    if (progress >= 75) return 'bg-green-100 text-green-700';
    if (progress >= 50) return 'bg-blue-100 text-blue-700';
    if (progress >= 25) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getInitialsBgColor = (initials) => {
    const colors = ['#10b981', '#ec4899', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444'];
    const index = initials.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 420;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const groupedDeals = stageStats.map(stageStat => ({
    ...stageStat,
    deals: deals.filter(d => d.stage === stageStat.stage)
  }));

  return (
    <div className="w-full bg-gray-50 min-h-screen flex flex-col">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[28px] font-bold text-gray-900">Deals</h1>
              <span className="bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-[12px] font-bold">125</span>
            </div>
            <div className="flex items-center gap-1 text-[13px] mt-1">
              <button className="text-orange-500 hover:text-orange-600 font-medium bg-transparent border-none cursor-pointer p-0">Home</button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600">Deals</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-[13px] font-medium text-gray-700 transition bg-white flex items-center gap-2">
              <Download size={16} /> Export
            </button>
            <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition text-[13px]">
              Add Deal
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
            className="flex gap-6 h-full overflow-x-auto overflow-y-auto pr-2 pb-4"
          >
            {groupedDeals.map((group) => (
              <div key={group.stage} className="flex-shrink-0 w-96">
                <div className="sticky top-0 bg-gray-50 mb-4 pt-0 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                        <h2 className="text-[15px] font-bold text-gray-900">{group.stage}</h2>
                      </div>
                      <p className="text-[12px] text-gray-600 mt-1">{group.deals.length} Deals - {formatCurrency(group.value)}</p>
                    </div>
                    <button className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-md transition">
                      <MoreVertical size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {group.deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm p-3.5 hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex-shrink-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: getInitialsBgColor(deal.initials) }}
                        >
                          {deal.initials}
                        </div>
                        <button className="text-gray-400 hover:bg-gray-100 p-1 rounded-md transition">
                          <MoreVertical size={14} strokeWidth={1.5} />
                        </button>
                      </div>

                      <h3 className="text-[13px] font-semibold text-gray-900 mb-2 line-clamp-2">{deal.company}</h3>

                      <div className="space-y-1.5 mb-3 text-[12px]">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">💰</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(deal.value)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">✉️</span>
                          <span className="text-gray-600 truncate text-[11px]">{deal.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📞</span>
                          <span className="text-gray-600 text-[11px]">{deal.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">📍</span>
                          <span className="text-gray-600 text-[11px]">{deal.location}</span>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-[9px] font-bold"></div>
                          <span className="text-[11px] text-gray-700 flex-1 truncate">{deal.owner}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${getProgressColor(deal.progress)}`}>
                            {deal.progress}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>📅 {deal.date}</span>
                        <div className="flex gap-1.5">
                          <button className="text-gray-400 hover:text-gray-600">✉️</button>
                          <button className="text-gray-400 hover:text-gray-600">📞</button>
                          <button className="text-gray-400 hover:text-gray-600">💬</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 bg-white border border-gray-300 rounded-full p-2 shadow-md hover:shadow-lg hover:bg-gray-50 transition opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>

          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 bg-white border border-gray-300 rounded-full p-2 shadow-md hover:shadow-lg hover:bg-gray-50 transition opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-white text-center">
        <p className="text-[12px] text-gray-500 font-medium">Copyright © 2025 <span className="text-red-600 font-semibold">Preadmin</span></p>
      </div>
    </div>
  );
};

export default CrmDealsPage;
