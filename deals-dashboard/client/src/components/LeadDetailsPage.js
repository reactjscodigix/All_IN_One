import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, FileText, User, Building2, Zap } from 'lucide-react';
import { leadsAPI, companiesAPI } from '../services/api';
import ConvertLeadModal from './ConvertLeadModal';

const LeadDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertType, setConvertType] = useState('contact');
  const [companies, setCompanies] = useState([]);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchLeadDetails();
    fetchCompanies();
  }, [id]);

  const fetchLeadDetails = async () => {
    try {
      setLoading(true);
      const response = await leadsAPI.getById(id);
      setLead(response);
      setEditData(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch lead');
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await companiesAPI.getAll();
      setCompanies(response);
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await leadsAPI.update(id, { ...lead, lead_status: newStatus });
      setLead(prev => ({ ...prev, lead_status: newStatus, status: newStatus }));
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleEditSave = async () => {
    try {
      await leadsAPI.update(id, editData);
      setLead(editData);
      setIsEditing(false);
      alert('Lead updated successfully');
    } catch (err) {
      alert('Failed to update lead: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await leadsAPI.delete(id);
      alert('Lead deleted successfully');
      navigate('/leads');
    } catch (err) {
      alert('Failed to delete lead: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'New': 'bg-blue-100 text-blue-800',
      'Contacted': 'bg-yellow-100 text-yellow-800',
      'Qualified': 'bg-green-100 text-green-800',
      'Unqualified': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleConvert = async (data) => {
    try {
      if (convertType === 'contact') {
        await leadsAPI.convertToContact(id, data);
        alert('Lead converted to contact successfully');
      } else if (convertType === 'company') {
        await leadsAPI.convertToCompany(id, data);
        alert('Lead converted to company successfully');
      } else if (convertType === 'deal') {
        await leadsAPI.convertToDeal(id, data);
        alert('Lead converted to deal successfully');
      }
      navigate('/leads');
    } catch (err) {
      alert('Conversion failed: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Loading lead details...</div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <button
          onClick={() => navigate('/leads')}
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium mb-6"
        >
          <ArrowLeft size={18} /> Back to Leads
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error || 'Lead not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/leads')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{lead.name || lead.lead_name}</h1>
            <p className="text-gray-600 text-sm mt-1">Lead ID: {lead.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            <Edit2 size={18} /> {isEditing ? 'Cancel' : 'Edit'}
          </button>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            <Trash2 size={18} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6 border-b pb-4">
              <h2 className="text-xl font-semibold text-gray-900">Lead Information</h2>
              <div className="flex gap-2">
                <select
                  value={editData.status || editData.lead_status || 'New'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border-0 cursor-pointer ${getStatusColor(editData.status || editData.lead_status)}`}
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Unqualified">Unqualified</option>
                </select>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lead Name *</label>
                    <input
                      type="text"
                      value={editData.lead_name || ''}
                      onChange={(e) => setEditData({...editData, lead_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={editData.email || ''}
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData({...editData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                    <input
                      type="text"
                      value={editData.company || ''}
                      onChange={(e) => setEditData({...editData, company: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                    <select
                      value={editData.lead_source || ''}
                      onChange={(e) => setEditData({...editData, lead_source: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
                    >
                      <option value="Website">Website</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Instagram">Instagram</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="Twitter">Twitter</option>
                      <option value="Google Ads">Google Ads</option>
                      <option value="Referral">Referral</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Email Campaign">Email Campaign</option>
                      <option value="Event">Event</option>
                      <option value="Trade Show">Trade Show</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <select
                      value={editData.rating || 5}
                      onChange={(e) => setEditData({...editData, rating: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
                    >
                      {[1, 2, 3, 4, 5].map(i => <option key={i} value={i}>{i} Star{i !== 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={editData.notes || ''}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleEditSave}
                  className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-gray-600">Lead Name</label>
                  <p className="text-lg font-medium text-gray-900">{lead.name || lead.lead_name}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Email</label>
                  <p className="text-lg font-medium text-gray-900 truncate">{lead.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Phone</label>
                  <p className="text-lg font-medium text-gray-900">{lead.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Company</label>
                  <p className="text-lg font-medium text-gray-900">{lead.company || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Source</label>
                  <p className="text-lg font-medium text-gray-900">{lead.source || lead.lead_source}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Rating</label>
                  <p className="text-lg font-medium text-gray-900">{lead.rating} ⭐</p>
                </div>
              </div>
            )}
          </div>

          {lead.notes && !isEditing && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText size={20} className="text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
              </div>
              <p className="text-gray-700">{lead.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Convert Lead</h3>
            <p className="text-sm text-gray-600 mb-4">
              Convert this lead into other entities to move it through your sales pipeline.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setConvertType('contact');
                  setIsConvertModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-700 font-medium transition text-left"
              >
                <User size={18} />
                <div>
                  <div>Convert to Contact</div>
                  <div className="text-xs font-normal">Add as a contact person</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setConvertType('company');
                  setIsConvertModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-purple-700 font-medium transition text-left"
              >
                <Building2 size={18} />
                <div>
                  <div>Convert to Company</div>
                  <div className="text-xs font-normal">Add as a company account</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setConvertType('deal');
                  setIsConvertModalOpen(true);
                }}
                className="w-full flex items-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg text-green-700 font-medium transition text-left"
              >
                <Zap size={18} />
                <div>
                  <div>Convert to Deal</div>
                  <div className="text-xs font-normal">Create a sales opportunity</div>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Flow</h3>
            <div className="space-y-3">
              {['New', 'Contacted', 'Qualified', 'Unqualified'].map((status, index) => (
                <div key={status} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    (lead.status || lead.lead_status) === status 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-blue-700">
              <strong>Tip:</strong> A qualified lead can be converted to a contact, company, or deal. Unqualified leads can be archived or deleted.
            </p>
          </div>
        </div>
      </div>

      <ConvertLeadModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        onSubmit={handleConvert}
        convertType={convertType}
        leadData={lead}
        companies={companies}
      />
    </div>
  );
};

export default LeadDetailsPage;
