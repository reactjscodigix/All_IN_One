import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Plus, GripVertical, MoreVertical } from 'lucide-react';
import { dealsAPI, contactsAPI, companiesAPI } from '../services/api';
import AddNewDealModal from './AddNewDealModal';

const DealsKanbanBoard = ({ onDealClick, onDealUpdate }) => {
  const [deals, setDeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [loading, setLoading] = useState(true);

  const PIPELINE_STAGES = ['New', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  const STAGE_COLORS = {
    'New': { bg: 'bg-blue-50', border: 'border-blue-200', header: 'bg-blue-100', text: 'text-blue-700' },
    'Proposal': { bg: 'bg-yellow-50', border: 'border-yellow-200', header: 'bg-yellow-100', text: 'text-yellow-700' },
    'Negotiation': { bg: 'bg-purple-50', border: 'border-purple-200', header: 'bg-purple-100', text: 'text-purple-700' },
    'Closed Won': { bg: 'bg-green-50', border: 'border-green-200', header: 'bg-green-100', text: 'text-green-700' },
    'Closed Lost': { bg: 'bg-red-50', border: 'border-red-200', header: 'bg-red-100', text: 'text-red-700' }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dealsRes, contactsRes, companiesRes] = await Promise.all([
        dealsAPI.getAll(),
        contactsAPI.getAll(),
        companiesAPI.getAll()
      ]);

      if (Array.isArray(dealsRes)) {
        const formattedDeals = dealsRes.map(deal => ({
          id: deal.id,
          name: deal.deal_name || 'Untitled Deal',
          value: parseFloat(deal.deal_value) || 0,
          stage: deal.pipeline || deal.stage || 'New',
          probability: deal.probability || 0,
          expectedCloseDate: deal.expected_close_date,
          contact: deal.contact_id,
          company: deal.company_id,
          description: deal.description || '',
          priority: deal.priority || 'Medium',
          ...deal
        }));
        setDeals(formattedDeals);
      }

      setContacts(contactsRes || []);
      setCompanies(companiesRes || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async (formData) => {
    try {
      const response = await dealsAPI.create(formData);
      if (response.id) {
        const newDeal = {
          id: response.id,
          name: formData.deal_name,
          value: parseFloat(formData.deal_value),
          stage: formData.pipeline || 'New',
          probability: 0,
          priority: formData.priority,
          ...formData
        };
        setDeals(prev => [newDeal, ...prev]);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error('Error creating deal:', err);
    }
  };

  const handleDragStart = (deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (newStage) => {
    if (!draggedDeal) return;

    try {
      await dealsAPI.update(draggedDeal.id, {
        ...draggedDeal,
        pipeline: newStage,
        stage: newStage
      });

      setDeals(prev =>
        prev.map(deal =>
          deal.id === draggedDeal.id
            ? { ...deal, stage: newStage, pipeline: newStage }
            : deal
        )
      );

      if (onDealUpdate) {
        onDealUpdate({ ...draggedDeal, stage: newStage });
      }
    } catch (err) {
      console.error('Error updating deal stage:', err);
    } finally {
      setDraggedDeal(null);
    }
  };

  const getStageDeals = (stage) => {
    return deals.filter(deal => (deal.pipeline || deal.stage || 'New') === stage);
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === parseInt(companyId));
    return company?.name || 'Unknown';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-700',
      'Medium': 'bg-yellow-100 text-yellow-700',
      'Low': 'bg-green-100 text-green-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const formatCurrency = (value) => `$${(value / 1000).toFixed(0)}K`;

  const filteredDeals = deals.filter(deal =>
    deal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCompanyName(deal.company_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading pipeline...</div>;
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen flex flex-col">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[28px] font-bold text-gray-900">Deal Pipeline</h1>
              <span className="bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-[12px] font-bold">{deals.length}</span>
            </div>
            <div className="flex items-center gap-1 text-[13px] mt-1">
              <button className="text-orange-500 hover:text-orange-600 font-medium bg-transparent border-none cursor-pointer p-0">Home</button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600">Pipeline</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-[13px] font-medium text-gray-700 transition bg-white flex items-center gap-2">
              <Download size={16} /> Export
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition text-[13px]">
              <Plus size={16} /> Add Deal
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search deals..."
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

      <div className="flex-1 px-6 pb-6 overflow-x-auto">
        <div className="flex gap-6 h-full">
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = getStageDeals(stage);
            const colors = STAGE_COLORS[stage];

            return (
              <div
                key={stage}
                className={`flex-shrink-0 w-96 ${colors.bg} border ${colors.border} rounded-lg flex flex-col`}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(stage)}
              >
                <div className={`${colors.header} px-4 py-3 rounded-t-lg flex items-center justify-between`}>
                  <div>
                    <h3 className={`font-semibold text-sm ${colors.text}`}>{stage}</h3>
                    <p className="text-xs text-gray-600 mt-1">{stageDeals.length} deals</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {stageDeals.map((deal) => (
                    <div
                      key={deal.id}
                      draggable
                      onDragStart={() => handleDragStart(deal)}
                      onClick={() => onDealClick && onDealClick(deal)}
                      className="bg-white rounded-lg border border-gray-200 p-3 cursor-move hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <GripVertical size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-gray-900 truncate">{deal.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{getCompanyName(deal.company_id)}</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                          <MoreVertical size={14} />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(deal.value)}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(deal.priority)}`}>
                            {deal.priority}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Probability:</span>
                            <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${deal.probability}%` }}
                              ></div>
                            </div>
                            <span className="text-gray-600 font-medium">{deal.probability}%</span>
                          </div>
                        </div>

                        {deal.expectedCloseDate && (
                          <p className="text-xs text-gray-600">
                            📅 {new Date(deal.expectedCloseDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageDeals.length === 0 && (
                    <div className="flex items-center justify-center h-32 text-gray-400">
                      <p className="text-sm">No deals in this stage</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AddNewDealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateDeal}
        contacts={contacts}
        companies={companies}
      />
    </div>
  );
};

export default DealsKanbanBoard;
