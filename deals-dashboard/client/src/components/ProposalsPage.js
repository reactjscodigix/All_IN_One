import React, { useState, useEffect } from 'react';
import { MoreVertical, Plus, Grid3x3, List, Download, Send, CheckCircle, XCircle, Edit2 } from 'lucide-react';
import { proposalsAPI, companiesAPI, contactsAPI, dealsAPI } from '../services/api';
import AddNewProposalModal from './AddNewProposalModal';

const ProposalsPage = ({ onViewDetails }) => {
  const [viewMode, setViewMode] = useState('grid');
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchText, setSearchText] = useState('');
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [showActionMenu, setShowActionMenu] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, [filterStatus, searchText]);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const filters = {};
      if (filterStatus) filters.status = filterStatus;
      if (searchText) filters.search = searchText;

      const [proposalsData, companiesData, contactsData, dealsData] = await Promise.all([
        proposalsAPI.getAll(filters),
        companiesAPI.getAll(),
        contactsAPI.getAll(),
        dealsAPI.getAll()
      ]);

      setProposals(proposalsData || []);
      setCompanies(companiesData || []);
      setContacts(contactsData || []);
      setDeals(dealsData || []);
    } catch (err) {
      setError('Failed to load proposals: ' + err.message);
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProposal = async (formData) => {
    try {
      await proposalsAPI.create({
        ...formData,
        created_by: 1,
      });
      setShowCreateModal(false);
      await loadInitialData();
    } catch (err) {
      alert('Failed to create proposal: ' + err.message);
    }
  };

  const handleStatusChange = async (proposalId, newStatus) => {
    try {
      await proposalsAPI.updateStatus(proposalId, {
        status: newStatus,
        action_by: 1
      });
      setShowActionMenu(null);
      await loadInitialData();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDeleteProposal = async (proposalId) => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      try {
        await proposalsAPI.delete(proposalId);
        await loadInitialData();
      } catch (err) {
        alert('Failed to delete proposal: ' + err.message);
      }
    }
  };

  const handleConvertToInvoice = async (proposalId) => {
    try {
      const result = await proposalsAPI.convertToInvoice(proposalId, { created_by: 1 });
      alert('Proposal converted to invoice: ' + result.invoiceNumber);
      await loadInitialData();
    } catch (err) {
      alert('Failed to convert proposal: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Accepted': 'bg-green-100 text-green-700',
      'Draft': 'bg-blue-100 text-blue-700',
      'Submitted': 'bg-purple-100 text-purple-700',
      'Approved': 'bg-emerald-100 text-emerald-700',
      'Sent': 'bg-teal-100 text-teal-700',
      'Declined': 'bg-red-100 text-red-700',
      'Rejected': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const ProposalCard = ({ proposal }) => {
    const company = companies.find(c => c.id === proposal.client_id);
    const currency = proposal.currency || 'USD';
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
        <div className="flex items-start justify-between mb-3">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
            {proposal.proposal_number}
          </span>
          <div className="relative">
            <button 
              onClick={() => setShowActionMenu(showActionMenu === proposal.id ? null : proposal.id)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <MoreVertical size={18} className="text-gray-400" />
            </button>
            {showActionMenu === proposal.id && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-300 rounded shadow-lg z-10">
                <button
                  onClick={() => handleStatusChange(proposal.id, 'Sent')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <Send size={14} /> Send
                </button>
                <button
                  onClick={() => handleStatusChange(proposal.id, 'Approved')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <CheckCircle size={14} /> Approve
                </button>
                <button
                  onClick={() => handleStatusChange(proposal.id, 'Rejected')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                >
                  <XCircle size={14} /> Reject
                </button>
                {proposal.status === 'Accepted' && (
                  <button
                    onClick={() => handleConvertToInvoice(proposal.id)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2 border-t"
                  >
                    <Download size={14} /> Convert to Invoice
                  </button>
                )}
                <button
                  onClick={() => handleDeleteProposal(proposal.id)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-700 flex items-center gap-2 border-t"
                >
                  <XCircle size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 mb-1">{proposal.title}</h3>
        <p className="text-xs text-gray-500 mb-3">Client: {company?.company_name || 'Unknown'}</p>

        <div className="space-y-2 mb-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <span>💰</span>
            <span>Total: {currency} {proposal.total_amount || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>Date: {new Date(proposal.proposal_date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>⏳</span>
            <span>Valid Till: {proposal.validity_date ? new Date(proposal.validity_date).toLocaleDateString() : 'N/A'}</span>
          </div>
        </div>

        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(proposal.status)}`}>
          {proposal.status}
        </span>
      </div>
    );
  };

  const ProposalRow = ({ proposal }) => {
    const company = companies.find(c => c.id === proposal.client_id);
    const currency = proposal.currency || 'USD';
    
    return (
      <tr className="border-b hover:bg-gray-50">
        <td className="px-4 py-3 text-sm">
          <div className="font-medium text-gray-900">{proposal.proposal_number}</div>
          <div className="text-xs text-gray-500">{proposal.title}</div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-700">{company?.company_name || 'Unknown'}</td>
        <td className="px-4 py-3 text-sm font-medium text-gray-900">
          {currency} {proposal.total_amount || 0}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {new Date(proposal.proposal_date).toLocaleDateString()}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {proposal.validity_date ? new Date(proposal.validity_date).toLocaleDateString() : 'N/A'}
        </td>
        <td className="px-4 py-3 text-sm">
          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(proposal.status)}`}>
            {proposal.status}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-right relative">
          <div className="relative">
            <button 
              onClick={() => setShowActionMenu(showActionMenu === proposal.id ? null : proposal.id)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <MoreVertical size={18} className="text-gray-400" />
            </button>
            {showActionMenu === proposal.id && (
              <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-300 rounded shadow-lg z-10">
                <button
                  onClick={() => handleStatusChange(proposal.id, 'Sent')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Send
                </button>
                <button
                  onClick={() => handleStatusChange(proposal.id, 'Approved')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange(proposal.id, 'Rejected')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Reject
                </button>
                {proposal.status === 'Accepted' && (
                  <button
                    onClick={() => handleConvertToInvoice(proposal.id)}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 border-t"
                  >
                    Convert to Invoice
                  </button>
                )}
                <button
                  onClick={() => handleDeleteProposal(proposal.id)}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-100 text-red-700 border-t"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <AddNewProposalModal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProposal}
        companies={companies}
        contacts={contacts}
        deals={deals}
      />

      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Proposals 
            <span className="text-red-600 text-sm bg-red-100 px-2 py-1 rounded ml-2">
              {proposals.length}
            </span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Home / Proposals</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded-md text-sm bg-white hover:bg-gray-50"
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Submitted">Submitted</option>
            <option value="Approved">Approved</option>
            <option value="Sent">Sent</option>
            <option value="Accepted">Accepted</option>
            <option value="Declined">Declined</option>
            <option value="Rejected">Rejected</option>
          </select>

          <div className="flex items-center gap-2 border border-gray-300 rounded-md bg-white p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
            >
              <List size={18} />
            </button>
          </div>

          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
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
            placeholder="Search proposals..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full border border-gray-300 px-4 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading proposals...</p>
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No proposals found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {proposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Proposal</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Client</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-900">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Date</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Valid Till</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-900">Status</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <ProposalRow key={proposal.id} proposal={proposal} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-400 py-6 border-t mt-8">
        Copyright © 2025 <span className="text-blue-600 font-medium">CRM System</span>
      </div>
    </div>
  );
};

export default ProposalsPage;
