import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreVertical, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import AddNewPipelineModal from './AddNewPipelineModal';
import { pipelineAPI } from '../services/api';
import pipelineData from '../data/crmPipelineData.json';

const CrmPipelinePage = () => {
  const [pipelines, setPipelines] = useState(pipelineData.pipelines);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    try {
      const data = await pipelineAPI.getAll();
      if (Array.isArray(data) && data.length > 0) {
        const formattedData = data.map(p => ({
          id: p.id,
          name: p.name,
          dealValue: p.total_value || 0,
          numDeals: p.total_deals || 0,
          stage: p.stages ? p.stages.split(',')[0] : 'New',
          stageColor: '#8b5cf6',
          createdDate: new Date(p.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }),
          status: p.status || 'Active'
        }));
        setPipelines(formattedData);
      }
    } catch (error) {
      console.error('Failed to load pipelines:', error);
    }
  };

  const formatCurrency = (value) => {
    const formatted = (value / 100000).toFixed(2);
    return `$${formatted.replace('.', ',')}`;
  };

  const getStageColor = (stage) => {
    const colors = {
      'Win': '#10b981',
      'In Pipeline': '#8b5cf6',
      'Conversation': '#06b6d4',
      'Lost': '#ef4444'
    };
    return colors[stage] || '#6b7280';
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    });
  };

  const filteredPipelines = pipelines.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPipelines = [...filteredPipelines].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    if (typeof aVal === 'string') {
      return sortConfig.direction === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
  });

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUp size={14} className="text-gray-300" />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={14} className="text-gray-600" /> 
      : <ChevronDown size={14} className="text-gray-600" />;
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen flex flex-col">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold text-red-600">Pipeline</h1>
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm font-bold">125</span>
            </div>
            <div className="flex items-center gap-1 text-sm mt-1">
              <button className="text-orange-500 hover:text-orange-600 font-medium bg-transparent border-none cursor-pointer p-0">Home</button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600">Pipeline</span>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition text-sm"
          >
            <Plus size={18} /> Add Pipeline
          </button>
        </div>

        <div className="flex items-center gap-3">
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
            <span>Sort By</span>
            <ChevronDown size={16} />
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition bg-white flex items-center gap-2">
            <Filter size={16} /> Filter
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition bg-white flex items-center gap-2">
            <Download size={16} /> Export
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mt-4">Date Range: 28 Nov 25 - 28 Nov 25</p>
      </div>

      <div className="flex-1 px-6 overflow-hidden flex flex-col">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-2 font-semibold text-gray-700 text-sm hover:text-gray-900">
                      Pipeline Name
                      <SortIcon column="name" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort('dealValue')} className="flex items-center gap-2 font-semibold text-gray-700 text-sm hover:text-gray-900">
                      Total Deal Value
                      <SortIcon column="dealValue" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort('numDeals')} className="flex items-center gap-2 font-semibold text-gray-700 text-sm hover:text-gray-900">
                      No of Deals
                      <SortIcon column="numDeals" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">Stages</th>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort('createdDate')} className="flex items-center gap-2 font-semibold text-gray-700 text-sm hover:text-gray-900">
                      Created Date
                      <SortIcon column="createdDate" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <button onClick={() => handleSort('status')} className="flex items-center gap-2 font-semibold text-gray-700 text-sm hover:text-gray-900">
                      Status
                      <SortIcon column="status" />
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 text-sm">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedPipelines.map((pipeline) => (
                  <tr key={pipeline.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900 text-sm">{pipeline.name}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-sm font-medium">{formatCurrency(pipeline.dealValue)}</td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{pipeline.numDeals}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-1 w-12 rounded-full" 
                          style={{ backgroundColor: getStageColor(pipeline.stage) }}
                        ></div>
                        <span className="text-gray-700 text-sm">{pipeline.stage}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700 text-sm">{pipeline.createdDate}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pipeline.status === 'Active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {pipeline.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded transition">
                        <MoreVertical size={18} strokeWidth={1.5} />
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
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-100 transition">−</button>
              <button className="w-8 h-8 bg-red-600 text-white rounded font-semibold text-sm">1</button>
              <button className="p-2 border border-gray-300 rounded hover:bg-gray-100 transition">+</button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-white text-center">
        <p className="text-xs text-gray-500">Copyright © 2025 <span className="text-red-600 font-semibold">Preadmin</span></p>
      </div>

      <AddNewPipelineModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadPipelines();
        }}
      />
    </div>
  );
};

export default CrmPipelinePage;
