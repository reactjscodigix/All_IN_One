import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const AddNewDealModal = ({ isOpen, onClose, onSubmit, contacts = [], projects = [], companies = [], dealToEdit = null, isCompanyContext = false }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [openPanels, setOpenPanels] = useState({
    basic: true,
    details: true,
    dates: true,
    advanced: true,
    visibility: false,
  });

  const [formData, setFormData] = useState({
    deal_name: '',
    pipeline: '',
    status: 'Pending',
    deal_value: '',
    currency: 'USD',
    period: '',
    period_value: '',
    contact_id: '',
    project_ids: [],
    due_date: '',
    expected_close_date: '',
    assignee_id: '',
    follow_up_date: '',
    source: '',
    tags: [],
    priority: 'Medium',
    description: '',
    company_id: '',
    visibility: 'public',
    selectedPeople: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [projectSearch, setProjectSearch] = useState('');
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [selectPeopleDropdownOpen, setSelectPeopleDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/users`);
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  useEffect(() => {
    if (isOpen && dealToEdit) {
      setFormData({
        deal_name: dealToEdit.deal_name || dealToEdit.company || '',
        pipeline: dealToEdit.pipeline || dealToEdit.stage || '',
        status: dealToEdit.status || 'Pending',
        deal_value: dealToEdit.deal_value || dealToEdit.value || '',
        currency: dealToEdit.currency || 'USD',
        period: dealToEdit.period || '',
        period_value: dealToEdit.period_value || '',
        contact_id: dealToEdit.contact_id || '',
        project_ids: Array.isArray(dealToEdit.project_ids) ? dealToEdit.project_ids : [],
        due_date: dealToEdit.due_date || '',
        expected_close_date: dealToEdit.expected_close_date || '',
        assignee_id: dealToEdit.assignee_id || '',
        follow_up_date: dealToEdit.follow_up_date || '',
        source: dealToEdit.source || '',
        tags: Array.isArray(dealToEdit.tags) ? dealToEdit.tags : (typeof dealToEdit.tags === 'string' ? [dealToEdit.tags].filter(t => t) : []),
        priority: dealToEdit.priority || 'Medium',
        description: dealToEdit.description || '',
        company_id: dealToEdit.company_id || '',
        visibility: dealToEdit.visibility || 'public',
        selectedPeople: Array.isArray(dealToEdit.selectedPeople) ? dealToEdit.selectedPeople : [],
      });
    } else if (isOpen) {
      setFormData({
        deal_name: '',
        pipeline: '',
        status: 'Pending',
        deal_value: '',
        currency: 'USD',
        period: '',
        period_value: '',
        contact_id: '',
        project_ids: [],
        due_date: '',
        expected_close_date: '',
        assignee_id: '',
        follow_up_date: '',
        source: '',
        tags: [],
        priority: 'Medium',
        description: '',
        company_id: '',
        visibility: 'public',
        selectedPeople: [],
      });
    }
  }, [isOpen, dealToEdit]);

  const togglePanel = (name) => {
    setOpenPanels((p) => ({ ...p, [name]: !p[name] }));
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

  const toggleProject = (projectId) => {
    setFormData(prev => ({
      ...prev,
      project_ids: prev.project_ids.includes(projectId)
        ? prev.project_ids.filter(p => p !== projectId)
        : [...prev.project_ids, projectId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    console.log('📤 Form submission - formData:', formData);
    
    if (!formData.deal_name || !formData.deal_value) {
      setError('Please fill in required fields: Deal Name and Deal Value');
      return;
    }

    if (!isCompanyContext && !formData.company_id) {
      setError('Please select a Company');
      return;
    }

    if (!isCompanyContext && !formData.contact_id) {
      setError('Please select a Contact');
      return;
    }

    if (!formData.pipeline) {
      setError('Please select a Pipeline');
      return;
    }

    console.log('✅ Form validation passed, submitting with data:', {
      deal_name: formData.deal_name,
      company_id: formData.company_id,
      contact_id: formData.contact_id,
      pipeline: formData.pipeline,
      deal_value: formData.deal_value
    });

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      handleCancel();
    } catch (err) {
      setError(err.message || 'Failed to create deal');
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      deal_name: '',
      pipeline: '',
      status: 'Pending',
      deal_value: '',
      currency: 'USD',
      period: '',
      period_value: '',
      contact_id: '',
      project_ids: [],
      due_date: '',
      expected_close_date: '',
      assignee_id: '',
      follow_up_date: '',
      source: '',
      tags: [],
      priority: 'Medium',
      description: '',
      company_id: '',
      visibility: 'public',
      selectedPeople: [],
    });
    setError('');
    setTagInput('');
    setProjectSearch('');
    setSelectPeopleDropdownOpen(false);
    onClose();
  };

  const getProjectName = (project) => {
    return project?.title || project?.project_name || project?.name || `Project ${project?.id}`;
  };

  const getInitials = (firstName, lastName) => {
    const first = (firstName || '').charAt(0).toUpperCase();
    const last = (lastName || '').charAt(0).toUpperCase();
    return (first + last) || '?';
  };

  const getSelectedPeopleNames = () => {
    return users.filter(user => 
      formData.selectedPeople.includes(user.id.toString()) || 
      formData.selectedPeople.includes(user.id)
    );
  };

  const filteredProjects = projects.filter(p => {
    const projectName = getProjectName(p).toLowerCase();
    return projectName.includes(projectSearch.toLowerCase());
  });

  React.useEffect(() => {
    console.log('🔍 Projects in AddNewDealModal:', projects);
    if (projects.length > 0) {
      console.log('📋 First project structure:', projects[0]);
    }
  }, [projects]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onClick={handleCancel}>
      <div 
        className="h-full w-full md:w-[80%] lg:w-[70%] xl:w-[65%] bg-white shadow-xl overflow-y-auto border-l border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-[#EAECF0] sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">{dealToEdit ? 'Edit Deal' : 'Add New Deal'}</h2>
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

        <form id="add-deal-form" onSubmit={handleSubmit} className="p-6 space-y-0">
          
          {/* Basic Deal Info Panel */}
          <div className="border-b border-[#EAECF0]">
            <button
              type="button"
              onClick={() => togglePanel('basic')}
              className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white font-semibold text-base">
                  🤝
                </div>
                <span className="font-semibold text-gray-900 text-sm">Deal Details</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-500 transition ${openPanels.basic ? 'rotate-180' : ''}`}
              />
            </button>

            {openPanels.basic && (
              <div className="px-4 py-5 space-y-5 border-t border-[#EAECF0] bg-white">
                
                {/* Deal Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deal Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="deal_name"
                    value={formData.deal_name}
                    onChange={handleInputChange}
                    placeholder="Enter deal name"
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                {/* Pipeline & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stage/Pipeline <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="pipeline"
                      value={formData.pipeline}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    >
                      <option value="">Select a Stage</option>
                      <option value="New">New</option>
                      <option value="Discovery">Discovery</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Qualified To Buy">Qualified To Buy</option>
                      <option value="Inpipeline">Inpipeline</option>
                      <option value="Follow Up">Follow Up</option>
                      <option value="Conversation">Conversation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    >
                      <option value="">Choose</option>
                      <option value="Pending">Pending</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                      <option value="In Progress">In Progress</option>
                    </select>
                  </div>
                </div>

                {/* Deal Value & Currency */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deal Value <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="deal_value"
                      value={formData.deal_value}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    >
                      <option value="">Choose</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>

                {/* Period & Period Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period
                    </label>
                    <select
                      name="period"
                      value={formData.period}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    >
                      <option value="">Choose</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annual">Annual</option>
                      <option value="One-time">One-time</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Period Value
                    </label>
                    <input
                      type="text"
                      name="period_value"
                      value={formData.period_value}
                      onChange={handleInputChange}
                      placeholder="Enter value"
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>

                {!isCompanyContext && (
                  <>
                    {/* Company */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="company_id"
                        value={formData.company_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                      >
                        <option value="">Select Company</option>
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.company_name || company.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Contact */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="contact_id"
                        value={formData.contact_id}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                      >
                        <option value="">Select Contact</option>
                        {contacts.map((contact) => (
                          <option key={contact.id} value={contact.id}>
                            {contact.first_name} {contact.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {/* Projects */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project
                  </label>
                  <div className="space-y-2 relative">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search and select projects..."
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        onFocus={() => setShowProjectDropdown(true)}
                        onBlur={() => setTimeout(() => setShowProjectDropdown(false), 150)}
                        className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                      />
                      {showProjectDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                          {filteredProjects.length > 0 ? (
                            filteredProjects.map(project => (
                              <button
                                key={project.id}
                                type="button"
                                onClick={() => {
                                  toggleProject(project.id);
                                  setProjectSearch('');
                                }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-[#EAECF0] last:border-b-0 flex items-center gap-2 ${
                                  formData.project_ids.includes(project.id) ? 'bg-blue-50' : ''
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.project_ids.includes(project.id)}
                                  onChange={() => {}}
                                  className="w-4 h-4"
                                />
                                <span className="flex-1">{getProjectName(project)}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-sm text-gray-500">No projects found</div>
                          )}
                        </div>
                      )}
                    </div>
                    {Array.isArray(formData.project_ids) && formData.project_ids.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.project_ids.map(pid => {
                          const project = projects.find(p => p.id === pid);
                          return (
                            <span key={pid} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {getProjectName(project)}
                              <button
                                type="button"
                                onClick={() => toggleProject(pid)}
                                className="hover:text-blue-900"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dates Panel */}
          <div className="border-b border-[#EAECF0]">
            <button
              type="button"
              onClick={() => togglePanel('dates')}
              className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white font-semibold text-base">
                  📅
                </div>
                <span className="font-semibold text-gray-900 text-sm">Dates</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-500 transition ${openPanels.dates ? 'rotate-180' : ''}`}
              />
            </button>

            {openPanels.dates && (
              <div className="px-4 py-5 space-y-5 border-t border-[#EAECF0] bg-white">
                
                {/* Due Date & Expected Close Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Closing Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="expected_close_date"
                      value={formData.expected_close_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignee <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="assignee_id"
                    value={formData.assignee_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                  >
                    <option value="">Select Assignee</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.first_name || user.name} {user.last_name || ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Follow Up Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Follow Up Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="follow_up_date"
                    value={formData.follow_up_date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Advanced Panel */}
          <div className="border-b border-[#EAECF0]">
            <button
              type="button"
              onClick={() => togglePanel('advanced')}
              className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white font-semibold text-base">
                  ⚙️
                </div>
                <span className="font-semibold text-gray-900 text-sm">Advanced</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-500 transition ${openPanels.advanced ? 'rotate-180' : ''}`}
              />
            </button>

            {openPanels.advanced && (
              <div className="px-4 py-5 space-y-5 border-t border-[#EAECF0] bg-white">
                
                {/* Source & Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    >
                      <option value="">Select</option>
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Cold Call">Cold Call</option>
                      <option value="Email">Email</option>
                      <option value="Event">Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    >
                      <option value="">Select</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag(e)}
                        placeholder="Add tags..."
                        className="flex-1 px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-3 py-2.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition"
                      >
                        Add
                      </button>
                    </div>
                    {Array.isArray(formData.tags) && formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-amber-900"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter deal description"
                    rows="4"
                    className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Visibility Panel */}
          <div className="border-b border-[#EAECF0]">
            <button
              type="button"
              onClick={() => togglePanel('visibility')}
              className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white font-semibold text-base">
                  🔒
                </div>
                <span className="font-semibold text-gray-900 text-sm">Visibility</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-500 transition ${openPanels.visibility ? 'rotate-180' : ''}`}
              />
            </button>

            {openPanels.visibility && (
              <div className="px-4 py-5 space-y-4 border-t border-[#EAECF0] bg-white">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={formData.visibility === 'public'}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-red-500"
                    />
                    <span className="text-sm text-gray-700">Public</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={formData.visibility === 'private'}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-red-500"
                    />
                    <span className="text-sm text-gray-700">Private</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="visibility"
                      value="select"
                      checked={formData.visibility === 'select'}
                      onChange={handleInputChange}
                      className="w-4 h-4 accent-red-500"
                    />
                    <span className="text-sm text-gray-700">Select People</span>
                  </label>
                </div>

                {formData.visibility === 'select' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Users
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSelectPeopleDropdownOpen(!selectPeopleDropdownOpen)}
                        disabled={users.length === 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition disabled:opacity-50 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSelectedPeopleNames().length > 0 ? (
                              <>
                                <div className="flex -space-x-2">
                                  {getSelectedPeopleNames().slice(0, 3).map(user => (
                                    <div key={user.id} className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-semibold border border-white">
                                      {getInitials(user.first_name, user.last_name)}
                                    </div>
                                  ))}
                                </div>
                                <span className="text-sm text-gray-700">
                                  {getSelectedPeopleNames().length} user{getSelectedPeopleNames().length !== 1 ? 's' : ''} selected
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-500">Select users</span>
                            )}
                          </div>
                          <span className="text-gray-400">▼</span>
                        </div>
                      </button>

                      {selectPeopleDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                          {users.map(user => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                const isSelected = formData.selectedPeople.includes(user.id.toString()) || formData.selectedPeople.includes(user.id);
                                setFormData(prev => ({
                                  ...prev,
                                  selectedPeople: isSelected
                                    ? prev.selectedPeople.filter(id => id !== user.id.toString() && id !== user.id)
                                    : [...prev.selectedPeople, user.id.toString()]
                                }));
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                            >
                              <input
                                type="checkbox"
                                checked={formData.selectedPeople.includes(user.id.toString()) || formData.selectedPeople.includes(user.id)}
                                readOnly
                                className="w-4 h-4"
                              />
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
                    <p className="text-xs text-gray-500 mt-1">Click users to select/deselect</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#EAECF0]">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? 'Creating...' : 'Create New'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewDealModal;
