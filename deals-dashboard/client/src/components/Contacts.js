import React, { useState } from 'react';
import { Mail, Phone, MapPin, MoreVertical, Plus, MessageCircle, Users } from 'lucide-react';
import contactsData from '../data/contactsData.json';

const Contacts = () => {
  const [contacts] = useState(contactsData.contacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredContacts, setFilteredContacts] = useState(contacts);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = contacts.filter(contact =>
      contact.name.toLowerCase().includes(term) ||
      contact.email.toLowerCase().includes(term) ||
      contact.position.toLowerCase().includes(term)
    );
    setFilteredContacts(filtered);
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
            <div className="relative w-full max-w-xs">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-gray-400 text-[13px] bg-white"
              />
            </div>
            <button className="px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 text-[13px] font-medium text-gray-700 transition bg-white">
              Filter
            </button>
          </div>

          <button className="bg-[#F62416] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition text-[13px]">
            <Plus size={18} strokeWidth={2.5} />
            Add Contacts
          </button>
        </div>
      </div>

      <div className="px-6 pb-8">
        <div className="grid grid-cols-4 gap-6">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-white border border-[#EAECF0] rounded-[12px] shadow-[0_2px_6px_rgba(0,0,0,0.05)] p-5"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div
                    style={{ backgroundColor: getAvatarColor(contact.avatar) }}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-[13px] flex-shrink-0"
                  >
                    {contact.avatar}
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
                <button className="text-[#9CA3AF] hover:bg-gray-100 p-1 rounded-md transition flex-shrink-0">
                  <MoreVertical size={16} strokeWidth={2} />
                </button>
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
                  <button className="hover:text-gray-900 transition p-0.5" title="Email">
                    <Mail size={15} strokeWidth={1.5} />
                  </button>
                  <button className="hover:text-gray-900 transition p-0.5" title="Phone">
                    <Phone size={15} strokeWidth={1.5} />
                  </button>
                  <button className="hover:text-gray-900 transition p-0.5" title="Chat">
                    <MessageCircle size={15} strokeWidth={1.5} />
                  </button>
                  <button className="hover:text-gray-900 transition p-0.5" title="Users">
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
