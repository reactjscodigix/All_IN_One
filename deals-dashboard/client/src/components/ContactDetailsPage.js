import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, Mail, Phone, MapPin, Plus, MoreVertical, Calendar, Heart, Tag, Globe, Download } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const ContactDetailsPage = ({ contactId, onBack }) => {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activities');
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const location = useLocation();
  const contactIdFromState = location.state?.contactId || contactId;
  const contactFromState = location.state?.contact;

  const fetchContactDetails = useCallback(async () => {
    try {
      if (!contactIdFromState) {
        setLoading(false);
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/contacts/${contactIdFromState}`);
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

  const fetchNotes = useCallback(async () => {
    try {
      if (!contactIdFromState) return;
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/contacts/${contactIdFromState}/notes`);
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  }, [contactIdFromState]);

  const fetchActivities = useCallback(async () => {
    try {
      if (!contactIdFromState) return;
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/contacts/${contactIdFromState}/activities`);
      if (response.ok) {
        const data = await response.json();
        setActivities(data);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }, [contactIdFromState]);

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      alert('Please enter a note');
      return;
    }

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/contacts/${contactIdFromState}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_text: newNote, created_by: 'Current User' }),
      });

      if (response.ok) {
        setNewNote('');
        setShowAddNote(false);
        fetchNotes();
      } else {
        alert('Failed to create note');
      }
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Error creating note');
    }
  };

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

  useEffect(() => {
    if (contactIdFromState) {
      fetchNotes();
      fetchActivities();
    }
  }, [contactIdFromState, fetchNotes, fetchActivities]);

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
                      {activities && activities.length > 0 ? (
                        activities.map((activity) => (
                          <div key={activity.id} className="border border-[#E5E7EB] rounded-lg p-4 hover:shadow-sm transition">
                            <div className="flex items-start gap-4">
                              <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
                                {activity.activity_icon || '📊'}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-sm text-gray-900 font-medium">{activity.activity_text || activity.activity_type}</p>
                                </div>
                                <p className="text-xs text-gray-500">{activity.created_by || 'Unknown'}</p>
                                <div className="mt-2 pt-2 border-t border-[#E5E7EB]">
                                  <p className="text-xs text-blue-600 font-medium">📅 {new Date(activity.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No activities yet</p>
                      )}
                      <div className="flex justify-center pt-4">
                        <button className="px-4 py-2 text-blue-600 text-sm font-medium hover:bg-blue-50 rounded-lg transition">
                          📅 Add Activity
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'notes' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-6 flex items-center justify-between">
                      <span>Notes</span>
                      <button
                        onClick={() => setShowAddNote(!showAddNote)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        + Add Note
                      </button>
                    </h3>
                    {showAddNote && (
                      <div className="mb-6 p-4 border border-[#E5E7EB] rounded-lg bg-gray-50">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Write your note here..."
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-red-500"
                          rows="3"
                        />
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={handleAddNote}
                            className="px-4 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
                          >
                            Save Note
                          </button>
                          <button
                            onClick={() => setShowAddNote(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-100 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-4">
                      {notes && notes.length > 0 ? (
                        notes.map((note) => (
                          <div key={note.id} className="border border-[#E5E7EB] rounded-lg p-4 hover:shadow-sm transition">
                            <div className="flex items-start gap-4">
                              <div className="bg-red-100 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">
                                📝
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 font-medium">{note.note_text}</p>
                                <p className="text-xs text-gray-500 mt-1">{note.created_by || 'Unknown'}</p>
                                <p className="text-xs text-gray-400">{new Date(note.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No notes yet</p>
                      )}
                    </div>
                  </div>
                )}
                {activeTab !== 'activities' && activeTab !== 'notes' && (
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
