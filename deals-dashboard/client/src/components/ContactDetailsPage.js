import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Mail, Phone, MapPin, Plus, MoreVertical, Calendar, Heart, Tag, Globe, Download } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const ContactDetailsPage = ({ contactId, onBack }) => {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activities');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const location = useLocation();
  const contactIdFromState = location.state?.contactId || contactId;
  const contactFromState = location.state?.contact;

  const fetchContactDetails = useCallback(async () => {
    try {
      if (!contactIdFromState) {
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/contacts/${contactIdFromState}`);
      if (response.ok) {
        const data = await response.json();
        setContact(data);
      } else {
        console.error('Failed to fetch contact details');
      }
    } catch (error) {
      console.error('Error fetching contact details:', error);
    } finally {
      setLoading(false);
    }
  }, [contactIdFromState]);

  useEffect(() => {
    if (contactFromState) {
      setContact({
        id: contactFromState.id,
        first_name: contactFromState.name?.split(' ')[0] || '',
        last_name: contactFromState.name?.split(' ').slice(1).join(' ') || '',
        email: contactFromState.email || '',
        phone: contactFromState.phone || '',
        position: contactFromState.position || '',
        company_name: contactFromState.country || '',
        country: contactFromState.country || '',
      });
      setLoading(false);
    } else if (contactIdFromState) {
      fetchContactDetails();
    }
  }, [contactIdFromState, contactFromState, fetchContactDetails]);

  if (loading) {
    return (
      <div className="w-full bg-[#f5f6fa] min-h-screen p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="w-full bg-[#f5f6fa] min-h-screen p-6">
        <p className="text-gray-500">Contact not found</p>
      </div>
    );
  }

  const getAvatarColor = (initials) => {
    const colors = {
      'JD': '#3B82F6', 'SR': '#E74694', 'VL': '#22C55E', 'JL': '#F59E0B',
      'CT': '#8B5CF6', 'DM': '#06B6D4', 'RH': '#EC4899', 'JC': '#3B82F6',
      'JS': '#22C55E', 'BC': '#F59E0B', 'EA': '#8B5CF6', 'RC': '#06B6D4'
    };
    return colors[initials] || '#3B82F6';
  };

  const initials = `${contact.first_name?.charAt(0) || ''}${contact.last_name?.charAt(0) || ''}`.toUpperCase();
  const avatarColor = getAvatarColor(initials);

  const activities = [
    {
      id: 1,
      type: 'message',
      icon: '💬',
      text: 'You sent 1 Message to the contact.',
      time: '10:25 pm',
      date: '28 May 2025',
      color: 'bg-blue-100'
    },
    {
      id: 2,
      type: 'call',
      icon: '📞',
      text: 'Denwar responded to your appointment schedule question by call at 09:30pm.',
      time: '09:25 pm',
      date: '28 May 2025',
      color: 'bg-green-100'
    },
    {
      id: 3,
      type: 'note',
      icon: '📝',
      text: 'Notes added by Antony\nPlease accept my apologies for the inconvenience caused. It would be much appreciated if it\'s possible to reschedule to 6:00 PM, or any other day that week.',
      time: '10:00 pm',
      date: '27 May 2025',
      color: 'bg-red-100'
    },
    {
      id: 4,
      type: 'meeting',
      icon: '📅',
      text: 'Meeting With Abraham\nScheduled on 05:00 pm',
      time: '09:25 pm',
      date: '27 May 2025',
      color: 'bg-yellow-100'
    },
    {
      id: 5,
      type: 'call',
      icon: '📞',
      text: 'Drain responded to your appointment schedule question.',
      time: '09:25 pm',
      date: '27 May 2025',
      color: 'bg-green-100'
    }
  ];

  return (
    <div className="w-full bg-[#f5f6fa] min-h-screen">
      <div className="px-6 py-3 bg-white border-b border-[#EAECF0]">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="text-gray-400">Home</span>
            <span className="mx-2 text-gray-400">/</span>
            <span>Contacts</span>
          </div>
          <button onClick={onBack} className="text-[#F97316] hover:text-[#EA580C] text-sm font-medium flex items-center gap-1">
            <ChevronLeft size={18} />
            Back to Contacts
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div
                style={{ backgroundColor: avatarColor }}
                className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl flex-shrink-0"
              >
                {initials}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 mb-1">
                  {contact.first_name} {contact.last_name}
                </h1>
                <p className="text-gray-600 text-sm mb-2">
                  {contact.position || 'No position specified'}
                </p>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-medium rounded">🔒 Private</span>
                  <span className="text-yellow-400 text-sm">★ 5.0</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <Plus size={16} />
                Add Deal
              </button>
              <button className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition flex items-center gap-2">
                <Mail size={16} />
                Send Email
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition relative" onClick={() => setShowMoreMenu(!showMoreMenu)}>
                <MoreVertical size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3 flex flex-col gap-6">
            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-4">Basic Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail size={16} className="text-gray-500" />
                  <span>{contact.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone size={16} className="text-gray-500" />
                  <span>{contact.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={16} className="text-gray-500" />
                  <span>{contact.country || 'No location'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Calendar size={16} className="text-gray-500" />
                  <span>Created on 27 Sep 2025, 11:45 PM</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-4">Other Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="text-gray-600 text-xs font-medium">Language</label>
                  <p className="text-gray-900">English</p>
                </div>
                <div>
                  <label className="text-gray-600 text-xs font-medium">Currency</label>
                  <p className="text-gray-900">United States dollar</p>
                </div>
                <div>
                  <label className="text-gray-600 text-xs font-medium">Last Modified</label>
                  <p className="text-gray-900">27 Sep 2023, 11:45 pm</p>
                </div>
                <div>
                  <label className="text-gray-600 text-xs font-medium">Source</label>
                  <p className="text-gray-900">Paid Campaign</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-4">Tags</h3>
              <div className="flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">Collab</span>
                <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">Rated</span>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 text-sm">Company</h3>
                <button className="text-red-600 hover:text-red-700 text-xs font-medium">+ Add New</button>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                  <Globe size={16} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">Google, Inc</p>
                  <p className="text-gray-500 text-xs">www.google.com</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-4">Social Profile</h3>
              <div className="flex gap-3 text-gray-400">
                <button className="p-2 hover:bg-gray-50 rounded transition">📱</button>
                <button className="p-2 hover:bg-gray-50 rounded transition">🐦</button>
                <button className="p-2 hover:bg-gray-50 rounded transition">💼</button>
                <button className="p-2 hover:bg-gray-50 rounded transition">📷</button>
                <button className="p-2 hover:bg-gray-50 rounded transition">▶️</button>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 text-sm mb-4">Settings</h3>
              <div className="space-y-2 text-sm">
                <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-gray-700 flex items-center gap-2">
                  <Heart size={14} />
                  Add to Favourite
                </button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded text-gray-700 flex items-center gap-2">
                  <Tag size={14} />
                  Delete Contact
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-9">
            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm">
              <div className="flex border-b border-[#E5E7EB] px-6">
                {[
                  { id: 'activities', label: 'Activities', icon: '📊' },
                  { id: 'notes', label: 'Notes', icon: '📝' },
                  { id: 'calls', label: 'Calls', icon: '📞' },
                  { id: 'files', label: 'Files', icon: '📄' },
                  { id: 'email', label: 'Email', icon: '📧' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-red-600 text-gray-900'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2 py-3">
                  <button className="p-2 hover:bg-gray-50 rounded transition text-gray-600">
                    <Download size={16} />
                  </button>
                  <select className="text-sm border-none bg-transparent text-gray-600 hover:text-gray-900 focus:outline-none">
                    <option>Sort By ↓</option>
                  </select>
                </div>
              </div>

              <div className="p-6">
                {activeTab === 'activities' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-6 flex items-center justify-between">
                      <span>Activities</span>
                    </h3>
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div key={activity.id} className="border border-[#E5E7EB] rounded-lg p-4 hover:shadow-sm transition">
                          <div className="flex items-start gap-4">
                            <div className={`${activity.color} w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg`}>
                              {activity.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-900 font-medium">{activity.text}</p>
                              </div>
                              <p className="text-xs text-gray-500">{activity.time}</p>
                              {activity.date && (
                                <div className="mt-2 pt-2 border-t border-[#E5E7EB]">
                                  <p className="text-xs text-blue-600 font-medium">📅 {activity.date}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-center pt-4">
                        <button className="px-4 py-2 text-blue-600 text-sm font-medium hover:bg-blue-50 rounded-lg transition">
                          📅 Upcoming Activity
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab !== 'activities' && (
                  <p className="text-gray-600 text-sm">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} content goes here...
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-6 mt-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-2">Reminder *</label>
                  <select className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-gray-700 focus:outline-none focus:border-red-500">
                    <option>1 hr</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-2">Task Priority *</label>
                  <select className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-gray-700 focus:outline-none focus:border-red-500">
                    <option>High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 text-xs font-medium mb-2">Assigned To *</label>
                  <select className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm text-gray-700 focus:outline-none focus:border-red-500">
                    <option>Jerald Sen</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailsPage;
