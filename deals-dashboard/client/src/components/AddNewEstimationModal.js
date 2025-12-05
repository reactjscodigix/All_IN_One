import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';

const AddNewEstimationModal = ({ isOpen, onClose, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    client: '',
    billTo: '',
    shipTo: '',
    project: '',
    estimateBy: '',
    amount: '',
    currency: 'USD',
    estimateDate: '',
    expiryDate: '',
    status: 'Draft',
    tags: [],
    attachments: [],
    description: '',
  });

  const [tagInput, setTagInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchClientsAndProjects();
    }
  }, [isOpen]);

  const fetchClientsAndProjects = async () => {
    setLoadingData(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const [clientsRes, projectsRes, usersRes] = await Promise.all([
        fetch(`${apiUrl}/companies`),
        fetch(`${apiUrl}/projects`),
        fetch(`${apiUrl}/contacts`)
      ]);

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(Array.isArray(clientsData) ? clientsData : []);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(Array.isArray(projectsData) ? projectsData : []);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setClients([]);
      setProjects([]);
      setUsers([]);
    } finally {
      setLoadingData(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getSelectedEstimateBy = () => {
    if (!formData.estimateBy) return null;
    return users.find(u => u.id === parseInt(formData.estimateBy));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).slice(0, 5 - formData.attachments.length);
    const fileObjects = newFiles.map(file => ({
      name: file.name,
      size: file.size,
      file: file
    }));
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...fileObjects].slice(0, 5)
    }));
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.client) {
      setError('Please select a client');
      return;
    }

    if (!formData.amount) {
      setError('Please enter an amount');
      return;
    }

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      handleCancel();
    } catch (err) {
      setError(err.message || 'Failed to create estimation');
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      client: '',
      billTo: '',
      shipTo: '',
      project: '',
      estimateBy: '',
      amount: '',
      currency: 'USD',
      estimateDate: '',
      expiryDate: '',
      status: 'Draft',
      tags: [],
      attachments: [],
      description: '',
    });
    setError('');
    setTagInput('');
    setOwnerDropdownOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
      <div 
        className="h-full w-full md:w-[72%] lg:w-[60%] xl:w-[55%] bg-white shadow-xl overflow-y-auto border-l border-gray-200"
      >
        <div className="flex justify-between items-center p-6 border-b border-[#EAECF0] sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">Add New Estimation</h2>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-red-600 transition-colors text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form id="add-estimation-form" onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client<span className="text-red-500">*</span>
            </label>
            <select
              name="client"
              value={formData.client}
              onChange={handleInputChange}
              disabled={loadingData}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition disabled:opacity-50"
            >
              <option value="">{loadingData ? 'Loading clients...' : 'Choose'}</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.company_name || client.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill To<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="billTo"
                value={formData.billTo}
                onChange={handleInputChange}
                placeholder="Enter billing address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ship To<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="shipTo"
                value={formData.shipTo}
                onChange={handleInputChange}
                placeholder="Enter shipping address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Project<span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                className="text-red-600 hover:text-red-700 text-xs font-semibold"
              >
                + Add New
              </button>
            </div>
            <select
              name="project"
              value={formData.project}
              onChange={handleInputChange}
              disabled={loadingData}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition disabled:opacity-50"
            >
              <option value="">{loadingData ? 'Loading projects...' : 'Choose'}</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.project_name || project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimate By<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOwnerDropdownOpen(!ownerDropdownOpen)}
                disabled={loadingData}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition disabled:opacity-50 text-left flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {getSelectedEstimateBy() ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-semibold">
                        {getInitials(getSelectedEstimateBy().first_name, getSelectedEstimateBy().last_name)}
                      </div>
                      <span>{getSelectedEstimateBy().first_name} {getSelectedEstimateBy().last_name}</span>
                    </>
                  ) : (
                    <span className="text-gray-500">{loadingData ? 'Loading...' : 'Select'}</span>
                  )}
                </span>
                <span className="text-gray-400">▼</span>
              </button>

              {ownerDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {users.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          estimateBy: user.id.toString()
                        }));
                        setOwnerDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {getInitials(user.first_name, user.last_name)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-gray-500">{user.email || 'No email'}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency<span className="text-red-500">*</span>
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
              >
                <option value="">Choose</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="INR">INR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimate Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="estimateDate"
                value={formData.estimateDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date<span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status<span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
            >
              <option value="">Choose</option>
              <option value="Draft">Draft</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg bg-white min-h-[40px]">
              {formData.tags.map((tag, idx) => (
                <span key={idx} className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-red-200">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Enter value separated by comma"
                className="flex-1 outline-none text-sm min-w-[100px]"
                onKeyPress={(e) => e.key === 'Enter' && addTag(e)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachment<span className="text-red-500">*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                dragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
              }`}
            >
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 text-sm">
                Drop your files here or{' '}
                <button
                  type="button"
                  onClick={() => document.getElementById('file-input').click()}
                  className="text-red-600 hover:text-red-700 underline"
                >
                  browse
                </button>
              </p>
              <p className="text-gray-500 text-xs mt-1">Maximum size: 50 MB</p>
              <input
                id="file-input"
                type="file"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                accept="*"
              />
            </div>

            {formData.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="text-red-600 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description<span className="text-red-500">*</span>
            </label>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-300">
                <button type="button" className="p-1.5 hover:bg-gray-200 rounded transition" title="Bold">
                  <span className="font-bold text-sm">B</span>
                </button>
                <button type="button" className="p-1.5 hover:bg-gray-200 rounded transition italic" title="Italic">
                  <span className="italic text-sm">I</span>
                </button>
                <button type="button" className="p-1.5 hover:bg-gray-200 rounded transition underline" title="Underline">
                  <span className="underline text-sm">U</span>
                </button>
                <div className="w-px h-5 bg-gray-300"></div>
                <button type="button" className="p-1.5 hover:bg-gray-200 rounded transition" title="Link">
                  <span className="text-sm">🔗</span>
                </button>
                <div className="w-px h-5 bg-gray-300"></div>
                <button type="button" className="p-1.5 hover:bg-gray-200 rounded transition" title="Bullet list">
                  <span className="text-sm">•</span>
                </button>
                <button type="button" className="p-1.5 hover:bg-gray-200 rounded transition" title="Numbered list">
                  <span className="text-sm">1.</span>
                </button>
              </div>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter description"
                rows="4"
                className="w-full px-3 py-2 outline-none text-sm bg-white resize-none"
              />
            </div>
          </div>

        </form>

        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create New'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewEstimationModal;
