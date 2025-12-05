import React, { useState, useMemo, useEffect } from 'react';
import { Download, Plus, MoreVertical, FileText, Send, Copy, Trash2, Eye, Edit2, FileJson } from 'lucide-react';
import AddNewEstimationModal from './AddNewEstimationModal';
import { estimationsAPI } from '../services/api';

const EstimationsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('kanban');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterDateRange, setFilterDateRange] = useState('');
  const [selectedEstimation, setSelectedEstimation] = useState(null);
  const [actionMenu, setActionMenu] = useState(null);
  const [isLoadingEstimations, setIsLoadingEstimations] = useState(true);
  const [estimations, setEstimations] = useState([
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
      status: 'Draft',
      avatar: 'T',
    },
    {
      id: 2,
      company: 'Kofejob',
      type: 'Meeting',
      desc: 'TruelySell provides a multiple on-demand service based bootstrap html template.',
      estimateId: '#EST00021',
      amount: '$01,23,000',
      date: '15 Oct 2023',
      expiry: '05 Nov 2026',
      owner: 'Darlee Robertson',
      status: 'Draft',
      avatar: 'K',
    },
    {
      id: 3,
      company: 'Truelysell',
      type: 'Web App',
      desc: 'TruelySell provides a multiple on-demand service based bootstrap html template.',
      estimateId: '#EST00022',
      amount: '$01,23,000',
      date: '15 Oct 2023',
      expiry: '05 Nov 2026',
      owner: 'Darlee Robertson',
      status: 'Sent',
      avatar: 'T',
    },
    {
      id: 4,
      company: 'Doccure',
      type: 'Meeting',
      desc: 'TruelySell provides a multiple on-demand service based bootstrap html template.',
      estimateId: '#EST00023',
      amount: '$01,23,000',
      date: '15 Oct 2023',
      expiry: '05 Nov 2026',
      owner: 'Rachel Hampton',
      status: 'Sent',
      avatar: 'D',
    },
    {
      id: 5,
      company: 'Dreamschat',
      type: 'Meeting',
      desc: 'TruelySell provides a multiple on-demand service based bootstrap html template.',
      estimateId: '#EST00024',
      amount: '$01,23,000',
      date: '15 Oct 2023',
      expiry: '05 Nov 2026',
      owner: 'Sharon Roy',
      status: 'Accepted',
      avatar: 'D',
    },
    {
      id: 6,
      company: 'servbook',
      type: 'Meeting',
      desc: 'TruelySell provides a multiple on-demand service based bootstrap html template.',
      estimateId: '#EST00025',
      amount: '$01,23,000',
      date: '15 Oct 2023',
      expiry: '05 Nov 2026',
      owner: 'Jessica Louise',
      status: 'Accepted',
      avatar: 'S',
    },
    {
      id: 7,
      company: 'DreamPOS',
      type: 'Web App',
      desc: 'TruelySell provides a multiple on-demand service based bootstrap html template.',
      estimateId: '#EST00026',
      amount: '$01,23,000',
      date: '15 Oct 2023',
      expiry: '05 Nov 2026',
      owner: 'Carol Thomas',
      status: 'Declined',
      avatar: 'D',
    },
    {
      id: 8,
      company: 'Dreamsports',
      type: 'Meeting',
      desc: 'TruelySell provides a multiple on-demand service based bootstrap html template.',
      estimateId: '#EST00027',
      amount: '$01,23,000',
      date: '15 Oct 2023',
      expiry: '05 Nov 2026',
      owner: 'Jonathan Smith',
      status: 'Declined',
      avatar: 'D',
    },
  ]);

  const columns = [
    { id: 'Draft', name: 'Draft', color: '#FDB022' },
    { id: 'Sent', name: 'Sent', color: '#3B82F6' },
    { id: 'Accepted', name: 'Accepted', color: '#10B981' },
    { id: 'Declined', name: 'Declined', color: '#EF4444' },
  ];

  useEffect(() => {
    fetchEstimations();
  }, []);

  const fetchEstimations = async () => {
    setIsLoadingEstimations(true);
    try {
      const data = await estimationsAPI.getAll();
      setEstimations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching estimations:', err);
      setEstimations([]);
    } finally {
      setIsLoadingEstimations(false);
    }
  };

  const filteredEstimations = useMemo(() => {
    return estimations.filter(est => {
      const searchLower = searchTerm.toLowerCase();
      const clientName = est.company || est.client_name || '';
      const estimateId = est.estimateId || est.estimate_id || est.estimation_number || '';
      const status = est.status || '';

      const matchesSearch = 
        clientName.toLowerCase().includes(searchLower) ||
        estimateId.toLowerCase().includes(searchLower) ||
        status.toLowerCase().includes(searchLower);

      const matchesStatus = !filterStatus || status === filterStatus;
      const matchesClient = !filterClient || clientName === filterClient;

      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [estimations, searchTerm, filterStatus, filterClient]);

  const handleAddEstimation = async (formData) => {
    try {
      const tagsString = formData.tags.length > 0 ? JSON.stringify(formData.tags) : null;
      const estimationData = {
        client_id: formData.client,
        project_id: formData.project || null,
        bill_to: formData.billTo || null,
        ship_to: formData.shipTo || null,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        estimate_date: formData.estimateDate || null,
        expiry_date: formData.expiryDate || null,
        status: formData.status || 'Draft',
        tags: tagsString,
        description: formData.description || null,
        estimate_by: formData.estimateBy || null,
      };

      await estimationsAPI.create(estimationData);
      await fetchEstimations();
    } catch (err) {
      console.error('Error adding estimation:', err);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await estimationsAPI.delete(id);
      await fetchEstimations();
      setActionMenu(null);
    } catch (err) {
      console.error('Error deleting estimation:', err);
    }
  };

  const handleDownloadPDF = (estimation) => {
    console.log('Downloading PDF for:', estimation.estimateId);
    alert(`PDF download initiated for ${estimation.estimateId}`);
  };

  const handleSendEstimation = (estimation) => {
    console.log('Sending estimation:', estimation.estimateId);
    alert(`Estimation ${estimation.estimateId} sent to client`);
  };

  const handleConvertToInvoice = (estimation) => {
    console.log('Converting to invoice:', estimation.estimateId);
    alert(`Estimation ${estimation.estimateId} converted to invoice`);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': '#FDB022',
      'Sent': '#3B82F6',
      'Accepted': '#10B981',
      'Declined': '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  const ActionMenu = ({ estimation, onClose }) => (
    <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-xl z-20 w-48">
      <button
        onClick={() => {
          setSelectedEstimation(estimation);
          onClose();
        }}
        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
      >
        <Eye size={16} /> View
      </button>
      <button
        onClick={() => {
          console.log('Edit:', estimation.id);
          onClose();
        }}
        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
      >
        <Edit2 size={16} /> Edit
      </button>
      <button
        onClick={() => {
          handleDownloadPDF(estimation);
          onClose();
        }}
        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
      >
        <FileJson size={16} /> Download PDF
      </button>
      <button
        onClick={() => {
          handleSendEstimation(estimation);
          onClose();
        }}
        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
      >
        <Send size={16} /> Send to Client
      </button>
      <button
        onClick={() => {
          handleConvertToInvoice(estimation);
          onClose();
        }}
        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
      >
        <Copy size={16} /> Convert to Invoice
      </button>
      <button
        onClick={() => {
          handleDelete(estimation.id);
          onClose();
        }}
        className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
      >
        <Trash2 size={16} /> Delete
      </button>
    </div>
  );

  const getCardValue = (item, field) => {
    const fieldMap = {
      company: () => {
        const name = item.company || item.company_name || item.client_name;
        return name && name !== 'N/A' ? name : 'N/A';
      },
      type: () => item.type || item.project_name || 'N/A',
      desc: () => item.desc || item.description || 'N/A',
      estimateId: () => item.estimateId || item.estimate_id || item.estimation_number || 'N/A',
      amount: () => item.amount ? `${item.currency || '$'}${parseFloat(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A',
      date: () => item.date || item.estimate_date || 'N/A',
      expiry: () => item.expiry || item.expiry_date || 'N/A',
      avatar: () => item.avatar || (item.company || item.company_name || item.client_name || 'N')[0],
      owner: () => {
        const firstName = item.owner || item.creator_first_name;
        const lastName = item.creator_last_name;
        if (firstName && lastName) return `${firstName} ${lastName}`;
        return firstName || 'N/A';
      },
    };
    return fieldMap[field] ? fieldMap[field]() : '';
  };

  const EstimationCard = ({ item }) => (
    <div className="border border-gray-200 rounded-xl p-5 mb-4 bg-white shadow-sm hover:shadow-lg transition-all duration-300 cursor-move">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          {item.logo ? (
            <img 
              src={item.logo} 
              alt="company" 
              className="w-10 h-10 rounded-lg object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {getCardValue(item, 'company')[0]}
            </div>
          )}
          <div>
            <h3 className="font-bold text-base text-gray-900">{getCardValue(item, 'company')}</h3>
            <p className="text-xs text-gray-500 font-medium">{getCardValue(item, 'type')}</p>
          </div>
        </div>
        <div className="relative">
          <button 
            onClick={() => setActionMenu(actionMenu === item.id ? null : item.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical size={16} className="text-gray-500" />
          </button>
          {actionMenu === item.id && (
            <ActionMenu 
              estimation={item} 
              onClose={() => setActionMenu(null)}
            />
          )}
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-3 line-clamp-2">{getCardValue(item, 'desc')}</p>
      <div className="mt-4 space-y-2 text-xs text-gray-700 bg-gray-50 rounded-lg p-3">
        <p><span className="font-bold text-gray-900">Estimate ID :</span> <span className="font-semibold text-blue-600">{getCardValue(item, 'estimateId')}</span></p>
        <p><span className="font-bold text-gray-900">Amount :</span> <span className="font-bold text-gray-900">{getCardValue(item, 'amount')}</span></p>
        <p><span className="font-bold text-gray-900">Date :</span> {getCardValue(item, 'date')}</p>
        <p><span className="font-bold text-gray-900">Expiry Date :</span> {getCardValue(item, 'expiry')}</p>
      </div>
      <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-200">
        {item.avatar ? (
          <img 
            src={item.avatar} 
            alt="creator" 
            className="w-9 h-9 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
            {(item.creator_first_name?.[0] || 'U')}
          </div>
        )}
        <p className="text-sm font-semibold text-gray-800">{getCardValue(item, 'owner')}</p>
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
              <span className="inline-block px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">{filteredEstimations.length}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-2 font-medium">Home › Estimations</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <input
              type="text"
              placeholder="Search by client / ID / status"
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
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-5 py-2.5 bg-red-600 text-white rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
            >
              <Plus size={18} />
              Add Estimation
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Declined">Declined</option>
          </select>

          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Clients</option>
            {[...new Set(estimations.map(e => e.company || e.client_name).filter(Boolean))].sort().map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>

          <input
            type="date"
            value={filterDateRange}
            onChange={(e) => setFilterDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-6 px-8 py-6 pb-20 min-w-max h-full">
          {columns.map((col) => {
            const columnEstimations = filteredEstimations.filter((item) => item.status === col.id);
            return (
              <div key={col.id} className="min-w-[360px] w-[360px] bg-white border border-gray-200 rounded-xl p-5 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-200">
                  <h2 className="flex items-center gap-3 font-bold text-lg text-gray-900">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: col.color }}></span>
                    {col.name}
                    <span className="text-sm font-normal text-gray-500 ml-2">({columnEstimations.length})</span>
                  </h2>
                  <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors">
                    <Plus size={18} className="text-gray-600" />
                  </button>
                </div>

                {/* Cards */}
                <div className="space-y-0 flex-1 overflow-y-auto pr-2">
                  {columnEstimations.length > 0 ? (
                    columnEstimations.map((item) => (
                      <EstimationCard key={item.id} item={item} />
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                      No estimations
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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

      <AddNewEstimationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddEstimation}
      />
    </div>
  );
};

export default EstimationsPage;
