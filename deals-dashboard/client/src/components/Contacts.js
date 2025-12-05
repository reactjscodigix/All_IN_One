import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Phone, MapPin, Plus, MessageCircle, Users, ChevronDown, X, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddContactModal from './AddContactModal';
import ContactActionDropdown from './ContactActionDropdown';

const Contacts = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({});
  const [filters, setFilters] = useState({
    name: '',
    tags: [],
    owner: '',
    location: [],
    rating: [],
    status: []
  });
  const [filterOptions, setFilterOptions] = useState({
    tags: [],
    owners: [],
    locations: [],
    ratings: [],
    statuses: []
  });

  const applyFilters = useCallback((contactsList, filterObj, searchTermValue) => {
    return contactsList.filter(contact => {
      const matchSearch = 
        contact.name.toLowerCase().includes(searchTermValue) ||
        contact.email.toLowerCase().includes(searchTermValue) ||
        contact.position.toLowerCase().includes(searchTermValue);

      if (!matchSearch) return false;

      if (filterObj.name && !contact.name.toLowerCase().includes(filterObj.name.toLowerCase())) return false;
      if (filterObj.tags.length > 0 && !filterObj.tags.some(tag => contact.tags && contact.tags.includes(tag))) return false;
      if (filterObj.owner && contact.owner !== filterObj.owner) return false;
      if (filterObj.location.length > 0 && !filterObj.location.includes(contact.country)) return false;
      if (filterObj.rating.length > 0 && !filterObj.rating.includes(contact.rating)) return false;
      if (filterObj.status.length > 0 && !filterObj.status.includes(contact.status || 'Active')) return false;

      return true;
    });
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = applyFilters(contacts, filters, term);
    setFilteredContacts(filtered);
  };

  const handleFilterChange = (filterType, value, isCheckbox = false) => {
    setFilters(prev => {
      let updated = { ...prev };
      if (isCheckbox) {
        updated[filterType] = updated[filterType].includes(value)
          ? updated[filterType].filter(item => item !== value)
          : [...updated[filterType], value];
      } else {
        updated[filterType] = value;
      }
      const filtered = applyFilters(contacts, updated, searchTerm);
      setFilteredContacts(filtered);
      return updated;
    });
  };

  const handleResetFilters = () => {
    setFilters({
      name: '',
      tags: [],
      owner: '',
      location: [],
      rating: [],
      status: []
    });
    const filtered = applyFilters(contacts, {
      name: '',
      tags: [],
      owner: '',
      location: [],
      rating: [],
      status: []
    }, searchTerm);
    setFilteredContacts(filtered);
  };

  const toggleFilterSection = (section) => {
    setExpandedFilters(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const avatarColors = {
    'DR': '#3B82F6',
    'SR': '#E74694',
    'VL': '#22C55E',
    'JL': '#F59E0B',
    'CT': '#8B5CF6',
    'DM': '#06B6D4',
    'RH': '#EC4899',
    'JC': '#3B82F6',
    'JS': '#22C55E',
    'BC': '#F59E0B',
    'EA': '#8B5CF6',
    'RC': '#06B6D4'
  };

  const getAvatarColor = (initials) => {
    return avatarColors[initials] || '#3B82F6';
  };

  const getTagStyle = (tag) => {
    if (tag === 'Collab') {
      return { bg: '#E4F8ED', text: '#28C76F' };
    } else if (tag === 'VIP') {
      return { bg: '#FFF4DE', text: '#FFA200' };
    } else if (tag === 'Rated') {
      return { bg: '#FFF4DE', text: '#FFA200' };
    }
    return { bg: '#F3F4F6', text: '#6B7280' };
  };

  const transformContactData = (apiContacts) => {
    return apiContacts.map((contact) => {
      const initials = `${contact.first_name?.charAt(0) || ''}${contact.last_name?.charAt(0) || ''}`.toUpperCase();
      return {
        id: contact.id,
        name: `${contact.first_name} ${contact.last_name}`,
        email: contact.email || '',
        phone: contact.phone || '',
        position: contact.position || '',
        country: contact.country || contact.company_name || 'USA',
        owner: contact.owner || '',
        avatar: initials,
        avatarImage: contact.avatar || null,
        tags: contact.tags ? (typeof contact.tags === 'string' ? contact.tags.split(',').map(t => t.trim()) : Array.isArray(contact.tags) ? contact.tags : ['Collab']) : ['Collab'],
        rating: contact.rating || 0,
        status: contact.status || 'Active',
        collaborators: [
          { avatar: initials }
        ]
      };
    });
  };

  const generateFilterOptions = useCallback((contactsList) => {
    const tags = new Set();
    const owners = new Set();
    const locations = new Set();
    const ratings = new Set();
    const statuses = new Set();

    contactsList.forEach(contact => {
      if (contact.tags && Array.isArray(contact.tags)) {
        contact.tags.forEach(tag => tags.add(tag));
      }
      if (contact.owner) owners.add(contact.owner);
      if (contact.country) locations.add(contact.country);
      if (contact.rating) ratings.add(contact.rating);
      if (contact.status) statuses.add(contact.status);
    });

    setFilterOptions({
      tags: Array.from(tags).sort(),
      owners: Array.from(owners).sort(),
      locations: Array.from(locations).sort(),
      ratings: Array.from(ratings).sort((a, b) => b - a),
      statuses: Array.from(statuses).sort()
    });
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/contacts`);
      const data = await response.json();
      const transformedData = transformContactData(data);
      setContacts(transformedData);
      setFilteredContacts(transformedData);
      generateFilterOptions(transformedData);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  }, [generateFilterOptions]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleAddContact = async (formData) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        setIsModalOpen(false);
        await fetchContacts();
        navigate('/contact-details', { state: { contactId: result.id } });
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to create contact'}`);
      }
    } catch (error) {
      console.error('Error creating contact:', error);
      alert('Error creating contact. Check console for details.');
    }
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (contactId) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/contacts/${contactId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Contact deleted successfully!');
        fetchContacts();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete contact'}`);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Error deleting contact. Check console for details.');
    }
  };

  const handlePreview = (contact) => {
    navigate('/contact-details', { state: { contactId: contact.id, contact } });
  };

  const handleUpdateContact = async (formData) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/contacts/${selectedContact.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Contact updated successfully!');
        setIsEditModalOpen(false);
        setSelectedContact(null);
        fetchContacts();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to update contact'}`);
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Error updating contact. Check console for details.');
    }
  };

  return (
    <div className="w-full bg-gray-50">
      <div className="mb-8 px-6 pt-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-[28px] font-bold text-gray-900">Contacts</h1>
              <span className="bg-[#FFE5E5] text-[#F62416] px-2.5 py-0.5 rounded-full text-[12px] font-bold">
                125
              </span>
            </div>
            <div className="flex items-center gap-1 text-[13px] mt-1">
              <button className="text-[#F97316] hover:text-[#EA580C] font-medium bg-transparent border-none cursor-pointer p-0">
                Home
              </button>
              <span className="text-[#D1D5DB]">&gt;</span>
              <span className="text-[#6B7280]">Contacts</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="p-2 hover:bg-white rounded-lg transition text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-white rounded-lg transition text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 4H5a2 2 0 00-2 2v14a2 2 0 002 2h4m0-21v21m0-21h10a2 2 0 012 2v14a2 2 0 01-2 2h-10" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-9 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-gray-400 text-[13px] bg-white"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 text-[13px] font-medium text-gray-700 transition bg-white flex items-center gap-2"
              >
                Filter <ChevronDown size={16} />
              </button>
              {showFilter && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-[#E5E7EB] rounded-lg p-5 max-h-[calc(100vh-200px)] overflow-y-auto z-50 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 text-sm">Filter</h3>
                    <button
                      onClick={() => setShowFilter(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="border-b border-[#E5E7EB]">
                      <button
                        onClick={() => toggleFilterSection('name')}
                        className="w-full flex items-center gap-2 py-2 text-sm font-medium text-gray-900"
                      >
                        <ChevronDown size={16} className={`transition ${expandedFilters.name ? '' : '-rotate-90'}`} />
                        Name
                      </button>
                      {expandedFilters.name && (
                        <div className="pb-3 px-2">
                          <input
                            type="text"
                            placeholder="Search name"
                            value={filters.name}
                            onChange={(e) => handleFilterChange('name', e.target.value)}
                            className="w-full px-3 py-2 border border-[#E5E7EB] rounded text-sm focus:outline-none focus:border-red-500"
                          />
                        </div>
                      )}
                    </div>

                    <div className="border-b border-[#E5E7EB]">
                      <button
                        onClick={() => toggleFilterSection('tags')}
                        className="w-full flex items-center gap-2 py-2 text-sm font-medium text-gray-900"
                      >
                        <ChevronDown size={16} className={`transition ${expandedFilters.tags ? '' : '-rotate-90'}`} />
                        Tags
                      </button>
                      {expandedFilters.tags && (
                        <div className="pb-3 space-y-2 px-2">
                          {filterOptions.tags.length > 0 ? (
                            filterOptions.tags.map(tag => (
                              <label key={tag} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filters.tags.includes(tag)}
                                  onChange={(e) => handleFilterChange('tags', tag, true)}
                                  className="w-4 h-4 border border-[#E5E7EB] rounded cursor-pointer"
                                />
                                {tag}
                              </label>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">No tags available</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-b border-[#E5E7EB]">
                      <button
                        onClick={() => toggleFilterSection('owner')}
                        className="w-full flex items-center gap-2 py-2 text-sm font-medium text-gray-900"
                      >
                        <ChevronDown size={16} className={`transition ${expandedFilters.owner ? '' : '-rotate-90'}`} />
                        Owner
                      </button>
                      {expandedFilters.owner && (
                        <div className="pb-3 space-y-2 px-2">
                          {filterOptions.owners.length > 0 ? (
                            filterOptions.owners.map(owner => (
                              <label key={owner} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filters.owner === owner}
                                  onChange={(e) => handleFilterChange('owner', e.target.checked ? owner : '')}
                                  className="w-4 h-4 border border-[#E5E7EB] rounded cursor-pointer"
                                />
                                {owner}
                              </label>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">No owners available</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-b border-[#E5E7EB]">
                      <button
                        onClick={() => toggleFilterSection('location')}
                        className="w-full flex items-center gap-2 py-2 text-sm font-medium text-gray-900"
                      >
                        <ChevronDown size={16} className={`transition ${expandedFilters.location ? '' : '-rotate-90'}`} />
                        Location
                      </button>
                      {expandedFilters.location && (
                        <div className="pb-3 space-y-2 px-2">
                          {filterOptions.locations.length > 0 ? (
                            filterOptions.locations.map(location => (
                              <label key={location} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filters.location.includes(location)}
                                  onChange={(e) => handleFilterChange('location', location, true)}
                                  className="w-4 h-4 border border-[#E5E7EB] rounded cursor-pointer"
                                />
                                {location}
                              </label>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">No locations available</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-b border-[#E5E7EB]">
                      <button
                        onClick={() => toggleFilterSection('rating')}
                        className="w-full flex items-center gap-2 py-2 text-sm font-medium text-gray-900"
                      >
                        <ChevronDown size={16} className={`transition ${expandedFilters.rating ? '' : '-rotate-90'}`} />
                        Rating
                      </button>
                      {expandedFilters.rating && (
                        <div className="pb-3 space-y-2 px-2">
                          {filterOptions.ratings.length > 0 ? (
                            filterOptions.ratings.map(rating => (
                              <label key={rating} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filters.rating.includes(rating)}
                                  onChange={(e) => handleFilterChange('rating', rating, true)}
                                  className="w-4 h-4 border border-[#E5E7EB] rounded cursor-pointer"
                                />
                                <span>{'★'.repeat(Math.floor(rating))}{'☆'.repeat(5-Math.floor(rating))} {rating}</span>
                              </label>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">No ratings available</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="border-b border-[#E5E7EB]">
                      <button
                        onClick={() => toggleFilterSection('status')}
                        className="w-full flex items-center gap-2 py-2 text-sm font-medium text-gray-900"
                      >
                        <ChevronDown size={16} className={`transition ${expandedFilters.status ? '' : '-rotate-90'}`} />
                        Status
                      </button>
                      {expandedFilters.status && (
                        <div className="pb-3 space-y-2 px-2">
                          {filterOptions.statuses.length > 0 ? (
                            filterOptions.statuses.map(status => (
                              <label key={status} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={filters.status.includes(status)}
                                  onChange={(e) => handleFilterChange('status', status, true)}
                                  className="w-4 h-4 border border-[#E5E7EB] rounded cursor-pointer"
                                />
                                {status}
                              </label>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500">No statuses available</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-[#E5E7EB]">
                    <button
                      onClick={handleResetFilters}
                      className="flex-1 px-4 py-2 border border-[#E5E7EB] text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setShowFilter(false)}
                      className="flex-1 px-4 py-2 bg-[#F62416] text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
                    >
                      Filter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#F62416] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition text-[13px]"
          >
            <Plus size={18} strokeWidth={2.5} />
            Add Contacts
          </button>
        </div>
      </div>

      <AddContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddContact}
      />

      <AddContactModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedContact(null);
        }}
        onSubmit={handleUpdateContact}
        initialData={selectedContact}
        isEditMode={true}
      />

      <div className="px-6 pb-8">
        <div className="grid gap-6 grid-cols-4">
            {filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="bg-white border border-[#EAECF0] rounded-[12px] shadow-[0_2px_6px_rgba(0,0,0,0.05)] p-5"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-[13px] flex-shrink-0 overflow-hidden">
                      {contact.avatarImage ? (
                        <img src={contact.avatarImage} alt={contact.name} className="w-full h-full object-cover" />
                      ) : (
                        <div style={{ backgroundColor: getAvatarColor(contact.avatar) }} className="w-full h-full flex items-center justify-center text-white">
                          {contact.avatar}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-semibold text-gray-900 truncate">
                        {contact.name}
                      </h3>
                      <p className="text-[13px] text-[#6B7280] truncate">
                        {contact.position}
                      </p>
                    </div>
                  </div>
                  <ContactActionDropdown
                    contact={contact}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPreview={handlePreview}
                  />
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2.5 text-[13px] text-[#6B7280]">
                    <Mail size={15} strokeWidth={1.5} className="flex-shrink-0" />
                    <a href={`mailto:${contact.email}`} className="hover:text-gray-900 truncate transition">
                      {contact.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] text-[#6B7280]">
                    <Phone size={15} strokeWidth={1.5} className="flex-shrink-0" />
                    <span className="truncate">{contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[13px] text-[#6B7280]">
                    <MapPin size={15} strokeWidth={1.5} className="flex-shrink-0" />
                    <span className="truncate">{contact.country}</span>
                  </div>
                </div>

                <div className="flex gap-2 mb-4 flex-wrap">
                  {contact.tags.map((tag, idx) => {
                    const tagStyle = getTagStyle(tag);
                    return (
                      <span
                        key={idx}
                        style={{
                          backgroundColor: tagStyle.bg,
                          color: tagStyle.text
                        }}
                        className="text-[12px] px-3 py-1 rounded-md font-medium"
                      >
                        {tag}
                      </span>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-[#F3F4F6] flex items-center justify-between">
                  <div className="flex gap-4 text-[#6B7280]">
                    <a href={`mailto:${contact.email}`} className="hover:text-gray-900 transition p-0.5" title="Email">
                      <Mail size={15} strokeWidth={1.5} />
                    </a>
                    <a href={`tel:${contact.phone}`} className="hover:text-gray-900 transition p-0.5" title="Phone">
                      <Phone size={15} strokeWidth={1.5} />
                    </a>
                    <button className="hover:text-gray-900 transition p-0.5" title="Chat" onClick={() => alert(`Message for ${contact.name}`)}>
                      <MessageCircle size={15} strokeWidth={1.5} />
                    </button>
                    <button className="hover:text-gray-900 transition p-0.5" title="Users" onClick={() => alert(`Collaborators: ${contact.collaborators.map(c => c.avatar).join(', ')}`)}>
                      <Users size={15} strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="flex gap-1">
                    {contact.collaborators.slice(0, 3).map((collaborator, idx) => (
                      <div
                        key={idx}
                        style={{ backgroundColor: getAvatarColor(collaborator.avatar) }}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold border border-white"
                      >
                        {collaborator.avatar}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-[13px] text-[#9CA3AF] font-medium">
              No contacts found
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <button className="bg-[#F62416] text-white rounded-[8px] px-8 py-3 font-medium hover:opacity-90 transition text-[14px]">
            Load More
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
