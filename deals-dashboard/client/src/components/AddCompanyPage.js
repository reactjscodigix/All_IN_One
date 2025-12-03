import React, { useState, useRef, useEffect } from 'react';
import { Upload, ChevronDown, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const AddCompanyPage = () => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState(null);
  const [openPanels, setOpenPanels] = useState({
    basic: true,
    address: false,
    social: false,
    access: false,
  });
  
  const [contacts, setContacts] = useState([]);
  const [sources, setSources] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [contactInput, setContactInput] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState({
    logo: null,
    logoPreview: null,
    companyName: '',
    emailAddress: '',
    emailOptOut: false,
    phoneNumber: '',
    phone2: '',
    fax: '',
    website: '',
    industryType: '',
    reviews: '',
    owner: '',
    tags: [],
    source: '',
    currency: 'USD',
    language: 'English',
    description: '',
    contacts: [],
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    facebook: '',
    skype: '',
    linkedin: '',
    twitter: '',
    whatsapp: '',
    instagram: '',
    visibility: 'public',
    selectedPeople: [],
  });

  useEffect(() => {
    if (location.state?.company && location.state?.isEdit) {
      setIsEditMode(true);
      setEditingCompanyId(location.state.company.id);
      const company = location.state.company;
      setFormData(prev => ({
        ...prev,
        companyName: company.name || company.company_name || '',
        emailAddress: company.email || '',
        phoneNumber: company.phone || '',
        phone2: company.phone2 || '',
        fax: company.fax || '',
        website: company.website || '',
        industryType: company.industry || '',
        reviews: company.reviews || '',
        owner: company.owner || '',
        tags: company.tags ? (typeof company.tags === 'string' ? company.tags.split(',') : company.tags) : [],
        source: company.source || '',
        currency: company.currency || 'USD',
        language: company.language || 'English',
        description: company.description || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        zipCode: company.zipCode || company.zip_code || '',
        country: company.country || '',
        facebook: company.facebook || '',
        skype: company.skype || '',
        linkedin: company.linkedin || '',
        twitter: company.twitter || '',
        whatsapp: company.whatsapp || '',
        instagram: company.instagram || '',
        visibility: company.visibility || 'public',
        logoPreview: company.logo || null,
      }));
      window.history.replaceState({}, document.title);
    }
    fetchBackendData();
  }, []);

  const fetchBackendData = async () => {
    setLoadingData(true);
    try {
      const [contactsRes, sourcesRes, industriesRes] = await Promise.all([
        fetch('http://localhost:5000/api/contacts'),
        fetch('http://localhost:5000/api/sources'),
        fetch('http://localhost:5000/api/industries')
      ]);

      if (contactsRes.ok) {
        const data = await contactsRes.json();
        setContacts(Array.isArray(data) ? data : []);
      }
      
      if (sourcesRes.ok) {
        const data = await sourcesRes.json();
        setSources(Array.isArray(data) ? data : [
          { id: 1, name: 'Direct' },
          { id: 2, name: 'Referral' },
          { id: 3, name: 'Website' },
          { id: 4, name: 'Event' },
          { id: 5, name: 'Other' }
        ]);
      } else {
        setSources([
          { id: 1, name: 'Direct' },
          { id: 2, name: 'Referral' },
          { id: 3, name: 'Website' },
          { id: 4, name: 'Event' },
          { id: 5, name: 'Other' }
        ]);
      }

      if (industriesRes.ok) {
        const data = await industriesRes.json();
        setIndustries(Array.isArray(data) ? data : [
          { id: 1, name: 'Technology' },
          { id: 2, name: 'Healthcare' },
          { id: 3, name: 'Finance' },
          { id: 4, name: 'Retail' },
          { id: 5, name: 'Manufacturing' }
        ]);
      } else {
        setIndustries([
          { id: 1, name: 'Technology' },
          { id: 2, name: 'Healthcare' },
          { id: 3, name: 'Finance' },
          { id: 4, name: 'Retail' },
          { id: 5, name: 'Manufacturing' },
          { id: 6, name: 'Education' },
          { id: 7, name: 'Real Estate' },
          { id: 8, name: 'Hospitality' },
          { id: 9, name: 'Transportation' },
          { id: 10, name: 'Telecommunications' },
          { id: 11, name: 'Energy' },
          { id: 12, name: 'Media & Entertainment' },
          { id: 13, name: 'Aviation Tech' },
          { id: 14, name: 'Consulting' },
          { id: 15, name: 'Legal Services' }
        ]);
      }
    } catch (err) {
      console.error('Error fetching backend data:', err);
      setSources([
        { id: 1, name: 'Direct' },
        { id: 2, name: 'Referral' },
        { id: 3, name: 'Website' },
        { id: 4, name: 'Event' },
        { id: 5, name: 'Other' }
      ]);
      setIndustries([
        { id: 1, name: 'Technology' },
        { id: 2, name: 'Healthcare' },
        { id: 3, name: 'Finance' },
        { id: 4, name: 'Retail' },
        { id: 5, name: 'Manufacturing' },
        { id: 6, name: 'Education' },
        { id: 7, name: 'Real Estate' },
        { id: 8, name: 'Hospitality' },
        { id: 9, name: 'Transportation' },
        { id: 10, name: 'Telecommunications' },
        { id: 11, name: 'Energy' },
        { id: 12, name: 'Media & Entertainment' },
        { id: 13, name: 'Aviation Tech' },
        { id: 14, name: 'Consulting' },
        { id: 15, name: 'Legal Services' }
      ]);
    } finally {
      setLoadingData(false);
    }
  };

  const togglePanel = (name) => {
    setOpenPanels((p) => ({ ...p, [name]: !p[name] }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: file,
          logoPreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddContact = (contactId) => {
    const contact = contacts.find(c => c.id === parseInt(contactId));
    if (contact && !selectedContacts.find(c => c.id === contact.id)) {
      setSelectedContacts([...selectedContacts, contact]);
      setFormData(prev => ({
        ...prev,
        contacts: [...prev.contacts, contact.id]
      }));
      setContactInput('');
    }
  };

  const handleRemoveContact = (contactId) => {
    setSelectedContacts(selectedContacts.filter(c => c.id !== contactId));
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(id => id !== contactId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.companyName || !formData.emailAddress || !formData.phoneNumber) {
      setError('Please fill in required fields: Company Name, Email, and Phone');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        company_name: formData.companyName,
        email: formData.emailAddress,
        email_opt_out: formData.emailOptOut,
        phone: formData.phoneNumber,
        phone2: formData.phone2 || null,
        fax: formData.fax || null,
        website: formData.website || null,
        industry: formData.industryType || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        country: formData.country || null,
        reviews: formData.reviews || null,
        owner: formData.owner || null,
        tags: formData.tags.length > 0 ? formData.tags.join(',') : null,
        source: formData.source || null,
        currency: formData.currency || 'USD',
        language: formData.language || 'English',
        description: formData.description || null,
        facebook: formData.facebook || null,
        linkedin: formData.linkedin || null,
        twitter: formData.twitter || null,
        whatsapp: formData.whatsapp || null,
        instagram: formData.instagram || null,
        skype: formData.skype || null,
        visibility: formData.visibility || 'public',
        selected_people: formData.selectedPeople.length > 0 ? formData.selectedPeople : null,
        logo: formData.logoPreview || null,
      };

      const url = isEditMode 
        ? `http://localhost:5000/api/companies/${editingCompanyId}`
        : 'http://localhost:5000/api/companies';
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to ${isEditMode ? 'update' : 'create'} company`);
      }

      const data = await response.json();
      const companyId = isEditMode ? editingCompanyId : data.id;

      const companyResponse = await fetch(`http://localhost:5000/api/companies/${companyId}`);
      if (!companyResponse.ok) {
        throw new Error(`Failed to fetch ${isEditMode ? 'updated' : 'created'} company`);
      }

      const companyData = await companyResponse.json();

      navigate('/companies', { 
        state: { 
          companyUpdated: isEditMode,
          newCompanyAdded: !isEditMode,
          company: {
            id: companyData.id,
            name: companyData.company_name,
            email: companyData.email,
            phone: companyData.phone,
            address: companyData.address,
            website: companyData.website,
            industry: companyData.industry,
            createdAt: companyData.created_at,
            ...companyData
          }
        }
      });
    } catch (err) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} company`);
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/companies');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
      <div 
        className="h-full w-full md:w-[72%] lg:w-[60%] xl:w-[55%] bg-white shadow-xl overflow-y-auto border-l border-gray-200"
      >
        <div className="flex justify-between items-center p-6 border-b border-[#EAECF0] sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">{isEditMode ? 'Edit Company' : 'Add New Company'}</h2>
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

        <form id="add-company-form" onSubmit={handleSubmit} className="p-0 space-y-0">
          
          {/* Basic Info Panel */}
          <div className="border-b border-[#EAECF0]">
            <button
              type="button"
              onClick={() => togglePanel('basic')}
              className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white font-semibold text-base">
                  🏢
                </div>
                <span className="font-semibold text-gray-900 text-sm">Basic Info</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-500 transition ${openPanels.basic ? 'rotate-180' : ''}`}
              />
            </button>

            {openPanels.basic && (
              <div className="px-4 py-5 space-y-5 border-t border-[#EAECF0] bg-white">
                
                {/* Logo Upload */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#E5E7EB] flex items-center justify-center overflow-hidden bg-white">
                      {formData.logoPreview ? (
                        <img src={formData.logoPreview} alt="Company logo" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <Upload size={16} className="mx-auto text-[#9CA3AF]" />
                          <div className="text-[9px] text-[#9CA3AF] mt-1">Upload</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Upload size={16} />
                      Upload file
                    </button>
                    <p className="text-xs text-gray-500 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                {/* Email & Email Opt Out */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="emailOptOut"
                        checked={formData.emailOptOut}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded accent-red-500"
                      />
                      <span className="text-xs text-gray-600">Email Opt Out</span>
                    </label>
                  </div>
                  <input
                    type="email"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                {/* Phone 1 & Phone 2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="(201) 555-0123"
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone 2
                    </label>
                    <input
                      type="tel"
                      name="phone2"
                      value={formData.phone2}
                      onChange={handleInputChange}
                      placeholder="(201) 555-0123"
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>

                {/* Fax & Website */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fax
                    </label>
                    <input
                      type="tel"
                      name="fax"
                      value={formData.fax}
                      onChange={handleInputChange}
                      placeholder="Fax number"
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                </div>

                {/* Reviews & Owner */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reviews
                    </label>
                    <input
                      type="text"
                      name="reviews"
                      value={formData.reviews}
                      onChange={handleInputChange}
                      placeholder="e.g., 5.0"
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Owner
                    </label>
                    <select
                      name="owner"
                      value={formData.owner}
                      onChange={handleInputChange}
                      disabled={loadingData}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition disabled:opacity-50"
                    >
                      <option value="">{loadingData ? 'Loading...' : 'Select'}</option>
                      {contacts.map(contact => (
                        <option key={contact.id} value={contact.id}>
                          {contact.first_name} {contact.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tags & Source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 border border-[#E5E7EB] rounded-lg bg-white min-h-[40px]">
                    {formData.tags.map((tag, idx) => (
                      <span key={idx} className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-red-200">
                        {tag}
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            tags: prev.tags.filter((_, i) => i !== idx)
                          }))}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      placeholder="Enter value separated by comma"
                      className="flex-1 outline-none text-sm min-w-[100px]"
                      onBlur={(e) => {
                        if (e.target.value) {
                          const newTags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, ...newTags]
                          }));
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Source & Industry */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Source <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="source"
                      value={formData.source}
                      onChange={handleInputChange}
                      disabled={loadingData}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition disabled:opacity-50"
                    >
                      <option value="">Select</option>
                      {sources.map(src => (
                        <option key={src.id} value={src.name}>{src.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="industryType"
                      value={formData.industryType}
                      onChange={handleInputChange}
                      disabled={loadingData}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition disabled:opacity-50"
                    >
                      <option value="">Select</option>
                      {industries.map(ind => (
                        <option key={ind.id} value={ind.name}>{ind.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contacts */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contacts <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 border border-[#E5E7EB] rounded-lg bg-white min-h-[40px]">
                    {selectedContacts.map((contact) => (
                      <span key={contact.id} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-200">
                        <span className="w-5 h-5 rounded-full bg-blue-200 flex items-center justify-center text-xs">👤</span>
                        {contact.first_name} {contact.last_name}
                        <button
                          type="button"
                          onClick={() => handleRemoveContact(contact.id)}
                          className="text-blue-600 hover:text-blue-800 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {selectedContacts.length === 0 && (
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddContact(e.target.value);
                            e.target.value = '';
                          }
                        }}
                        disabled={loadingData}
                        className="flex-1 outline-none text-sm px-2 py-1 min-w-[100px]"
                      >
                        <option value="">{loadingData ? 'Loading...' : 'Select contact'}</option>
                        {contacts.map(contact => (
                          <option key={contact.id} value={contact.id}>
                            {contact.first_name} {contact.last_name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Currency & Language */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                      <option value="AUD">AUD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter company description"
                    rows="3"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Address Info Panel */}
          <div className="border-b border-[#EAECF0]">
            <button
              type="button"
              onClick={() => togglePanel('address')}
              className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white font-semibold text-base">
                  📍
                </div>
                <span className="font-semibold text-gray-900 text-sm">Address Info</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-500 transition ${openPanels.address ? 'rotate-180' : ''}`}
              />
            </button>

            {openPanels.address && (
              <div className="px-4 py-5 space-y-4 border-t border-[#EAECF0] bg-white">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter street address"
                    rows="3"
                    className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="Enter city" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="Enter state" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                    <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} placeholder="Enter zip code" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input type="text" name="country" value={formData.country} onChange={handleInputChange} placeholder="Enter country" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Social Profile Panel */}
          <div className="border-b border-[#EAECF0]">
            <button
              type="button"
              onClick={() => togglePanel('social')}
              className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white font-semibold text-base">
                  📱
                </div>
                <span className="font-semibold text-gray-900 text-sm">Social Profile</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-500 transition ${openPanels.social ? 'rotate-180' : ''}`}
              />
            </button>

            {openPanels.social && (
              <div className="px-4 py-5 border-t border-[#EAECF0] bg-white">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                    <input type="url" name="facebook" value={formData.facebook} onChange={handleInputChange} placeholder="https://facebook.com/..." className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                    <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="https://linkedin.com/..." className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                    <input type="url" name="twitter" value={formData.twitter} onChange={handleInputChange} placeholder="https://twitter.com/..." className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                    <input type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="Enter phone number" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                    <input type="url" name="instagram" value={formData.instagram} onChange={handleInputChange} placeholder="https://instagram.com/..." className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Skype</label>
                    <input type="text" name="skype" value={formData.skype} onChange={handleInputChange} placeholder="Enter Skype ID" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Access Panel */}
          <div className="border-b border-[#EAECF0]">
            <button
              type="button"
              onClick={() => togglePanel('access')}
              className="w-full text-left px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex items-center justify-center rounded bg-red-500 text-white font-semibold text-base">
                  🔒
                </div>
                <span className="font-semibold text-gray-900 text-sm">Access</span>
              </div>
              <ChevronDown 
                size={18} 
                className={`text-gray-500 transition ${openPanels.access ? 'rotate-180' : ''}`}
              />
            </button>

            {openPanels.access && (
              <div className="px-4 py-5 border-t border-[#EAECF0] bg-white">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-4">Visibility</label>
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
                      <select
                        multiple
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value);
                          setFormData(prev => ({
                            ...prev,
                            selectedPeople: selected
                          }));
                        }}
                        className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 transition"
                        value={formData.selectedPeople}
                      >
                        {contacts.map(contact => (
                          <option key={contact.id} value={contact.id}>
                            {contact.first_name} {contact.last_name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple users</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="p-6 flex justify-end gap-3 border-t border-[#EAECF0] sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 border border-[#E5E7EB] rounded-lg hover:bg-gray-100 text-sm font-medium transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            {isLoading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Company' : 'Create Company')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCompanyPage;
