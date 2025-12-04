import React, { useState, useEffect } from 'react';
import { MoreVertical, Plus, Download, Grid3x3, List, Eye, Trash2, Send, X, Filter, Search } from 'lucide-react';
import AddNewContractModal from './AddNewContractModal';
import ContractDetailsPage from './ContractDetailsPage';
import { contractsAPI, createContract } from '../services/api';

const ContractsPage = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [contracts, setContracts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedContract, setSelectedContract] = useState(null);
  const [showDetailsPage, setShowDetailsPage] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    company: '',
    dateFrom: '',
    dateTo: '',
  });
  const [showActionMenu, setShowActionMenu] = useState(null);
  const [showSendModal, setShowSendModal] = useState(null);
  const [sendEmail, setSendEmail] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const contractStatuses = ['Draft', 'Sent', 'Active', 'Expired', 'Cancelled'];

  useEffect(() => {
    fetchCompanies();
    fetchContracts();
  }, []);

  const fetchCompanies = async () => {
    setIsLoadingCompanies(true);
    try {
      const response = await fetch('http://localhost:5000/api/companies');
      if (response.ok) {
        const data = await response.json();
        setCompanies(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setCompanies([]);
    } finally {
      setIsLoadingCompanies(false);
    }
  };

  const fetchContracts = async () => {
    setIsLoading(true);
    try {
      const data = await contractsAPI.getAll();
      setContracts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setContracts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContract = async (formData) => {
    try {
      const contractData = {
        subject: formData.subject,
        start_date: formData.start_date,
        end_date: formData.end_date,
        client_id: formData.client,
        contract_type: formData.contract_type,
        contract_value: formData.contract_value,
        description: formData.description,
        status: 'Draft',
      };

      await createContract(contractData);
      setIsModalOpen(false);
      fetchContracts();
    } catch (err) {
      console.error('Error creating contract:', err);
      throw err;
    }
  };

  const handleDeleteContract = async (id) => {
    try {
      await contractsAPI.delete(id);
      fetchContracts();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting contract:', err);
    }
  };

  const handleSendContract = async () => {
    try {
      await contractsAPI.update(showSendModal, { 
        status: 'Sent',
        sent_to_email: sendEmail 
      });
      fetchContracts();
      setShowSendModal(null);
      setSendEmail('');
    } catch (err) {
      console.error('Error sending contract:', err);
    }
  };

  const handleDownloadContract = (contract) => {
    const element = document.createElement('a');
    const file = new Blob([`Contract: ${contract.subject}\n\nDetails:\n${JSON.stringify(contract, null, 2)}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `contract-${contract.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getFilteredContracts = () => {
    let filtered = contracts;

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.contract_type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    if (filters.company) {
      filtered = filtered.filter(c => c.client_id === parseInt(filters.company));
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(c => new Date(c.start_date) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(c => new Date(c.end_date) <= new Date(filters.dateTo));
    }

    return filtered;
  };

  const filteredContracts = getFilteredContracts();

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-700',
      'Sent': 'bg-blue-100 text-blue-700',
      'Active': 'bg-green-100 text-green-700',
      'Expired': 'bg-yellow-100 text-yellow-700',
      'Cancelled': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company ? (company.company_name || company.name) : 'Unknown';
  };

  const ContractCard = ({ contract }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(contract.status || 'Draft')}`}>
          {contract.status || 'Draft'}
        </span>
        <div className="relative">
          <button 
            onClick={() => setShowActionMenu(showActionMenu === contract.id ? null : contract.id)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <MoreVertical size={18} className="text-gray-400" />
          </button>
          {showActionMenu === contract.id && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
              <button 
                onClick={() => {
                  setSelectedContract(contract);
                  setShowDetailsPage(true);
                  setShowActionMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
              >
                <Eye size={16} className="text-gray-600" />
                <span className="text-sm">View Details</span>
              </button>
              <button 
                onClick={() => {
                  setShowSendModal(contract.id);
                  setShowActionMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
              >
                <Send size={16} className="text-gray-600" />
                <span className="text-sm">Send to Client</span>
              </button>
              <button 
                onClick={() => {
                  handleDownloadContract(contract);
                  setShowActionMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
              >
                <Download size={16} className="text-gray-600" />
                <span className="text-sm">Download</span>
              </button>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(contract.id);
                  setShowActionMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600"
              >
                <Trash2 size={16} />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1">{contract.subject}</h3>
      <p className="text-xs text-gray-500 mb-3">{contract.contract_type}</p>

      <div className="space-y-1 mb-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>{new Date(contract.start_date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>📆</span>
          <span>Till {new Date(contract.end_date).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 text-xs">
        <span>🏢</span>
        <span className="font-medium text-gray-900">{getCompanyName(contract.client_id)}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded font-medium">
          💰 ${contract.contract_value}
        </span>
      </div>
    </div>
  );

  const ContractRow = ({ contract }) => (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 text-sm font-medium text-gray-900">{contract.subject}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{getCompanyName(contract.client_id)}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{contract.contract_type}</td>
      <td className="px-6 py-4 text-sm text-gray-600">${contract.contract_value}</td>
      <td className="px-6 py-4 text-sm text-gray-600">{new Date(contract.start_date).toLocaleDateString()}</td>
      <td className="px-6 py-4 text-sm">
        <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(contract.status || 'Draft')}`}>
          {contract.status || 'Draft'}
        </span>
      </td>
      <td className="px-6 py-4 text-sm">
        <div className="relative">
          <button 
            onClick={() => setShowActionMenu(showActionMenu === contract.id ? null : contract.id)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <MoreVertical size={16} className="text-gray-400" />
          </button>
          {showActionMenu === contract.id && (
            <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
              <button 
                onClick={() => {
                  setSelectedContract(contract);
                  setShowDetailsPage(true);
                  setShowActionMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
              >
                <Eye size={16} className="text-gray-600" />
                <span className="text-sm">View Details</span>
              </button>
              <button 
                onClick={() => {
                  setShowSendModal(contract.id);
                  setShowActionMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
              >
                <Send size={16} className="text-gray-600" />
                <span className="text-sm">Send to Client</span>
              </button>
              <button 
                onClick={() => {
                  handleDownloadContract(contract);
                  setShowActionMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
              >
                <Download size={16} className="text-gray-600" />
                <span className="text-sm">Download</span>
              </button>
              <button 
                onClick={() => {
                  setShowDeleteConfirm(contract.id);
                  setShowActionMenu(null);
                }}
                className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600"
              >
                <Trash2 size={16} />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );

  if (showDetailsPage && selectedContract) {
    return (
      <ContractDetailsPage 
        contract={selectedContract}
        onBack={() => setShowDetailsPage(false)}
        onUpdate={() => {
          fetchContracts();
          setShowDetailsPage(false);
        }}
      />
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contracts <span className="text-red-600 text-sm bg-red-100 px-2 py-1 rounded ml-2">{filteredContracts.length}</span></h1>
          <p className="text-sm text-gray-500 mt-1">Home / Contracts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-300 rounded-md bg-white p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
            >
              <Grid3x3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'}`}
            >
              <List size={18} />
            </button>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
            <Plus size={18} />
            Add New Contract
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white px-6 py-4 border-b">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 pl-10 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className="border border-gray-300 px-3 py-2 rounded-md text-sm bg-white hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Filter size={16} />
            Filter
          </button>
        </div>

        {filterOpen && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Status</option>
                {contractStatuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Company</label>
              <select
                value={filters.company}
                onChange={(e) => setFilters({ ...filters, company: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">All Companies</option>
                {companies.map(c => (
                  <option key={c.id} value={c.id}>{c.company_name || c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading contracts...</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-600">No contracts found</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {filteredContracts.map((contract) => (
                  <ContractCard key={contract.id} contract={contract} />
                ))}
              </div>
            )}

            {viewMode === 'list' && (
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Company</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContracts.map((contract) => (
                      <ContractRow key={contract.id} contract={contract} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send Contract to Client</h3>
              <button 
                onClick={() => {
                  setShowSendModal(null);
                  setSendEmail('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Email</label>
              <input
                type="email"
                value={sendEmail}
                onChange={(e) => setSendEmail(e.target.value)}
                placeholder="Enter client email"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button 
                onClick={() => {
                  setShowSendModal(null);
                  setSendEmail('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendContract}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Contract?</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this contract? This action cannot be undone.</p>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleDeleteContract(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-gray-400 py-6 border-t mt-8">
        Copyright © 2025 <span className="text-red-600 font-medium">Preadmin</span>
      </div>

      <AddNewContractModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateContract}
        companies={companies}
      />
    </div>
  );
};

export default ContractsPage;
