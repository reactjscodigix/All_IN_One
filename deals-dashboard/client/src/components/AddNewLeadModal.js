import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import AddNewCompanyForm from './AddNewCompanyForm';

const AddNewLeadModal = ({ isOpen, onClose, onSubmit, companies = [], onCompanyAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    lead_type: 'Person',
    value: '',
    currency: 'USD',
    source: 'Website',
    industry: '',
    owner: '',
    status: 'New',
    tags: [],
    description: '',
    visibility: 'Public',
    selectedPeople: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false);
  const [selectPeopleDropdownOpen, setSelectPeopleDropdownOpen] = useState(false);
  const [isCompanyFormOpen, setIsCompanyFormOpen] = useState(false);
  const [localCompanies, setLocalCompanies] = useState(companies);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    setLocalCompanies(companies);
  }, [companies]);

  const fetchUsers = async () => {
    setLoadingData(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/contacts`);
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoadingData(false);
    }
  };

  const getSelectedOwner = () => {
    if (!formData.owner) return null;
    return users.find(u => u.id === parseInt(formData.owner));
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getSelectedPeopleNames = () => {
    return formData.selectedPeople
      .map(id => users.find(u => u.id === parseInt(id)))
      .filter(Boolean);
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

  const handleCreateCompany = async (companyData) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const apiPayload = {
        company_name: companyData.companyName,
        email: companyData.emailAddress,
        phone: companyData.phoneNumber,
        phone2: companyData.phone2,
        fax: companyData.fax,
        website: companyData.website,
        industry_type: companyData.industryType,
        employee_count: companyData.employeeCount,
        annual_revenue: companyData.annualRevenue,
        founded_year: companyData.foundedYear,
        address: companyData.address,
        city: companyData.city,
        state: companyData.state,
        zip_code: companyData.zipCode,
        country: companyData.country,
        facebook: companyData.facebook,
        skype: companyData.skype,
        linkedin: companyData.linkedin,
        twitter: companyData.twitter,
        whatsapp: companyData.whatsapp,
        instagram: companyData.instagram,
        visibility: companyData.visibility,
        reviews: companyData.reviews,
        owner_id: companyData.owner ? parseInt(companyData.owner) : null,
        tags: companyData.tags,
        source: companyData.source,
        currency: companyData.currency,
        language: companyData.language,
        description: companyData.description,
        email_opt_out: companyData.emailOptOut
      };

      const response = await fetch(`${apiUrl}/companies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create company');
      }

      const createdCompany = await response.json();
      
      const newCompany = {
        id: createdCompany.id,
        company_name: companyData.companyName,
        name: companyData.companyName,
        ...createdCompany
      };

      setLocalCompanies(prev => [newCompany, ...prev]);
      setFormData(prev => ({
        ...prev,
        company: createdCompany.id?.toString() || ''
      }));

      setIsCompanyFormOpen(false);
      
      if (onCompanyAdded) {
        onCompanyAdded(newCompany);
      }
    } catch (err) {
      console.error('Error creating company:', err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.name.trim()) {
      setError('Please fill in the required field: Lead Name');
      return;
    }
    
    if (!formData.value || parseFloat(formData.value) <= 0) {
      setError('Please fill in the required field: Value (must be greater than 0)');
      return;
    }
    
    if (!formData.currency) {
      setError('Please fill in the required field: Currency');
      return;
    }
    
    if (!formData.phone || !formData.phone.trim()) {
      setError('Please fill in the required field: Phone');
      return;
    }
    
    if (!formData.source) {
      setError('Please fill in the required field: Source');
      return;
    }
    
    if (!formData.industry) {
      setError('Please fill in the required field: Industry');
      return;
    }
    
    if (!formData.description || !formData.description.trim()) {
      setError('Please fill in the required field: Description');
      return;
    }

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      handleCancel();
    } catch (err) {
      setError(err.message || 'Failed to create lead');
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      lead_type: 'Person',
      value: '',
      currency: 'USD',
      source: 'Website',
      industry: '',
      owner: '',
      status: 'New',
      tags: [],
      description: '',
      visibility: 'Public',
      selectedPeople: [],
    });
    setError('');
    setTagInput('');
    setOwnerDropdownOpen(false);
    setSelectPeopleDropdownOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
      <div 
        className="h-full w-full md:w-[72%] lg:w-[60%] xl:w-[55%] bg-white shadow-xl overflow-y-auto border-l border-gray-200"
      >
        <div className="flex justify-between items-center p-6 border-b border-[#EAECF0] sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">Add New Lead</h2>
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

        <form id="add-lead-form" onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lead Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter lead name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lead Type
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="lead_type"
                  value="Person"
                  checked={formData.lead_type === 'Person'}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Person</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="lead_type"
                  value="Organization"
                  checked={formData.lead_type === 'Organization'}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Organization</span>
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Company Name
              </label>
              <button
                type="button"
                onClick={() => setIsCompanyFormOpen(true)}
                className="flex items-center gap-1 text-red-600 hover:text-red-700 font-medium text-sm transition"
              >
                <Plus size={16} />
                Add New
              </button>
            </div>
            <select
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
            >
              <option value="">Select</option>
              {localCompanies.map(c => (
                <option key={c.id} value={c.id}>
                  {c.company_name || c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Value<span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="value"
                value={formData.value}
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
                <option value="">Select</option>
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
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone<span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source<span className="text-red-500">*</span>
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
              >
                <option value="">Select</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry<span className="text-red-500">*</span>
              </label>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
              >
                <option value="">Select</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Education">Education</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Hospitality">Hospitality</option>
                <option value="Transportation">Transportation</option>
                <option value="Telecommunications">Telecommunications</option>
                <option value="Energy">Energy</option>
                <option value="Media & Entertainment">Media & Entertainment</option>
                <option value="Consulting">Consulting</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Owner
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setOwnerDropdownOpen(!ownerDropdownOpen)}
                disabled={loadingData}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition disabled:opacity-50 text-left flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  {getSelectedOwner() ? (
                    <>
                      <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-semibold">
                        {getInitials(getSelectedOwner().first_name, getSelectedOwner().last_name)}
                      </div>
                      <span>{getSelectedOwner().first_name} {getSelectedOwner().last_name}</span>
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
                          owner: user.id.toString()
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
                placeholder="Add tag"
                className="flex-1 outline-none text-sm min-w-[100px]"
                onKeyPress={(e) => e.key === 'Enter' && addTag(e)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description<span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Enter description"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Visibility
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="Public"
                  checked={formData.visibility === 'Public'}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Public</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="Private"
                  checked={formData.visibility === 'Private'}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Private</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="Select People"
                  checked={formData.visibility === 'Select People'}
                  onChange={handleInputChange}
                  className="w-4 h-4"
                />
                <span className="text-sm text-gray-700">Select People</span>
              </label>
            </div>

            {formData.visibility === 'Select People' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Users
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSelectPeopleDropdownOpen(!selectPeopleDropdownOpen)}
                    disabled={loadingData}
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
                            const isSelected = formData.selectedPeople.includes(user.id.toString());
                            setFormData(prev => ({
                              ...prev,
                              selectedPeople: isSelected
                                ? prev.selectedPeople.filter(id => id !== user.id.toString())
                                : [...prev.selectedPeople, user.id.toString()]
                            }));
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedPeople.includes(user.id.toString())}
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

      <AddNewCompanyForm
        isOpen={isCompanyFormOpen}
        onClose={() => setIsCompanyFormOpen(false)}
        onSubmit={handleCreateCompany}
      />
    </div>
  );
};

export default AddNewLeadModal;
