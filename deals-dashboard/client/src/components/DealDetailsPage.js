import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, MessageSquare, FileText, CheckSquare, MoreVertical, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { dealsAPI, contactsAPI, companiesAPI } from '../services/api';
import DealActivityLog from './DealActivityLog';
import DealTasksPanel from './DealTasksPanel';
import DealConversionModal from './DealConversionModal';

const DealDetailsPage = ({ dealId: propDealId, onBack }) => {
  const { id: paramDealId } = useParams();
  const dealId = paramDealId || propDealId;
  const [deal, setDeal] = useState(null);
  const [contact, setContact] = useState(null);
  const [company, setCompany] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  const PIPELINE_STAGES = ['New', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  useEffect(() => {
    fetchDealDetails();
  }, [dealId]);

  const fetchDealDetails = async () => {
    try {
      setLoading(true);
      const [dealRes, contactsRes, companiesRes] = await Promise.all([
        dealsAPI.getById(dealId),
        contactsAPI.getAll(),
        companiesAPI.getAll()
      ]);

      setDeal(dealRes);

      if (dealRes.contact_id) {
        const contactData = contactsRes.find(c => c.id === parseInt(dealRes.contact_id));
        setContact(contactData);
      }

      if (dealRes.company_id) {
        const companyData = companiesRes.find(c => c.id === parseInt(dealRes.company_id));
        setCompany(companyData);
      }
    } catch (err) {
      console.error('Error fetching deal details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateField = async (field, value) => {
    try {
      const updatedDeal = { ...deal, [field]: value };
      await dealsAPI.update(dealId, updatedDeal);
      setDeal(updatedDeal);
      setEditingField(null);
    } catch (err) {
      console.error('Error updating deal:', err);
    }
  };

  const handleStageChange = async (newStage) => {
    await handleUpdateField('pipeline', newStage);
  };

  const handleProbabilityChange = async (newProbability) => {
    await handleUpdateField('probability', newProbability);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-700',
      'Medium': 'bg-yellow-100 text-yellow-700',
      'Low': 'bg-green-100 text-green-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const getStageColor = (stage) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-700',
      'Proposal': 'bg-yellow-100 text-yellow-700',
      'Negotiation': 'bg-purple-100 text-purple-700',
      'Closed Won': 'bg-green-100 text-green-700',
      'Closed Lost': 'bg-red-100 text-red-700'
    };
    return colors[stage] || 'bg-gray-100 text-gray-700';
  };

  const formatCurrency = (value) => `$${(value / 1000).toFixed(0)}K`;

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading deal details...</div>;
  }

  if (!deal) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Deal not found</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{deal.deal_name}</h1>
              {company && <p className="text-sm text-gray-600">{company.name}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsConversionModalOpen(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition bg-white"
            >
              Convert Deal
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <MoreVertical size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Deal Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(deal.deal_value)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Priority</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(deal.priority)}`}>
                    {deal.priority || 'Medium'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Stage</p>
                  <select
                    value={deal.pipeline || deal.stage || 'New'}
                    onChange={(e) => handleStageChange(e.target.value)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold border-none cursor-pointer ${getStageColor(deal.pipeline || deal.stage)}`}
                  >
                    {PIPELINE_STAGES.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Win Probability</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={deal.probability || 0}
                      onChange={(e) => handleProbabilityChange(parseInt(e.target.value))}
                      className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-900 w-8">{deal.probability || 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Deal Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contact</p>
                  {contact && (
                    <p className="text-sm font-medium text-gray-900">
                      {contact.first_name} {contact.last_name}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expected Close Date</p>
                  <input
                    type="date"
                    value={deal.expected_close_date ? deal.expected_close_date.split('T')[0] : ''}
                    onChange={(e) => handleUpdateField('expected_close_date', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Currency</p>
                  <p className="text-sm font-medium text-gray-900">{deal.currency || 'USD'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Source</p>
                  <p className="text-sm font-medium text-gray-900">{deal.source || 'Not specified'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 ${
                    activeTab === 'details'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText size={16} /> Details
                </button>
                <button
                  onClick={() => setActiveTab('activities')}
                  className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 ${
                    activeTab === 'activities'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageSquare size={16} /> Activities & Notes
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 ${
                    activeTab === 'tasks'
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <CheckSquare size={16} /> Tasks
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Description</p>
                      <textarea
                        value={deal.description || ''}
                        onChange={(e) => handleUpdateField('description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm min-h-24 resize-none"
                        placeholder="Add deal description..."
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'activities' && (
                  <DealActivityLog dealId={dealId} />
                )}

                {activeTab === 'tasks' && (
                  <DealTasksPanel dealId={dealId} />
                )}
              </div>
            </div>
          </div>

          <div className="col-span-1 space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition bg-white flex items-center gap-2 justify-center">
                  <Plus size={16} /> Add Note
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition bg-white flex items-center gap-2 justify-center">
                  <MessageSquare size={16} /> Send Email
                </button>
                <button className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition bg-white flex items-center gap-2 justify-center">
                  <FileText size={16} /> Attach File
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Deal Created</p>
                    <p className="text-gray-600">
                      {deal.created_at ? new Date(deal.created_at).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>
                {deal.updated_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-400 mt-1 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900">Last Updated</p>
                      <p className="text-gray-600">
                        {new Date(deal.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <DealConversionModal
        isOpen={isConversionModalOpen}
        onClose={() => setIsConversionModalOpen(false)}
        deal={deal}
        onSuccess={onBack}
      />
    </div>
  );
};

export default DealDetailsPage;
