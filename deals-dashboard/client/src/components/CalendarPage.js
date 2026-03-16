import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Video, Phone, MessageSquare, Link as LinkIcon, ExternalLink, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { followupsAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import UpcomingEvents from './UpcomingEvents';

const CalendarPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [callEvents, setCallEvents] = useState([]);
  const [followupEvents, setFollowupEvents] = useState([]);
  const [customEvents, setCustomEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    category: 'Client Call'
  });

  const categoryColorMap = {
    'Client Call': 'bg-teal-100 border-l-4 border-teal-500',
    'Client Meeting': 'bg-blue-100 border-l-4 border-blue-500',
    'Proposal Discussion': 'bg-indigo-100 border-l-4 border-indigo-500',
    'Deal Negotiation': 'bg-orange-100 border-l-4 border-orange-500',
    'Payment Follow-Up': 'bg-green-100 border-l-4 border-green-500',
    'Internal Task': 'bg-pink-100 border-l-4 border-pink-500',
    'Team Meeting': 'bg-purple-100 border-l-4 border-purple-500',
    'Target Review': 'bg-yellow-100 border-l-4 border-yellow-500',
  };

  useEffect(() => {
    fetchCallHistory();
    fetchFollowups();
  }, []);

  const fetchFollowups = async () => {
    try {
      const filters = {};
      
      // If user is Sales Executive, only show their follow-ups
      if (user && (user.role === 'Sales Executive' || user.role === 'Sales' || user.department === 'Sales Department')) {
        const userName = user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : (user.username || user.first_name || '');
        if (userName) filters.assigned_to = userName;
      }

      const data = await followupsAPI.getAll(filters);
      const events = data.map((f) => ({
        id: `followup-${f.id}`,
        title: f.subject,
        date: new Date(f.scheduled_date),
        category: 'Follow-up',
        type: f.type,
        meetingLink: f.meeting_link,
        relatedName: f.related_name,
        color: f.type === 'Call' ? 'bg-teal-100 border-l-4 border-teal-500' : 
               f.type === 'Email' ? 'bg-indigo-100 border-l-4 border-indigo-500' :
               f.type.includes('Meeting') ? 'bg-blue-100 border-l-4 border-blue-500' :
               'bg-orange-100 border-l-4 border-orange-500'
      }));
      setFollowupEvents(events);
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
    }
  };

  const fetchCallHistory = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/call-history?limit=100`);
      if (response.ok) {
        const data = await response.json();
        const events = data.map((call) => ({
          id: `call-${call.id}`,
          title: `${call.call_type} - ${call.caller_name}`,
          date: new Date(call.created_at),
          category: call.call_type,
          color: call.call_type === 'Video Call' ? 'bg-indigo-100 border-l-4 border-indigo-500' : 'bg-cyan-100 border-l-4 border-cyan-500'
        }));
        setCallEvents(events);
      }
    } catch (error) {
      console.error('Error fetching call history:', error);
    }
  };

  const events = [...callEvents, ...followupEvents, ...customEvents];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddEvent = () => {
    if (!formData.title || !formData.date) {
      alert('Please fill in event name and date');
      return;
    }

    const newEvent = {
      id: `custom-${Date.now()}`,
      title: formData.title,
      date: new Date(formData.date),
      category: formData.category,
      color: categoryColorMap[formData.category] || 'bg-gray-100 border-l-4 border-gray-500'
    };

    setCustomEvents(prev => [...prev, newEvent]);
    setFormData({ title: '', date: '', category: 'Client Call' });
    setShowModal(false);
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const getEventsForDate = (day) => {
    return events.filter(e => 
      e.date.getDate() === day &&
      e.date.getMonth() === currentMonth.getMonth() &&
      e.date.getFullYear() === currentMonth.getFullYear()
    );
  };

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getEventIcon = (type) => {
    if (!type) return null;
    const t = type.toLowerCase();
    if (t.includes('call')) return <Phone size={10} className="inline mr-1" />;
    if (t.includes('meeting') || t.includes('video')) return <Video size={10} className="inline mr-1" />;
    if (t.includes('whatsapp') || t.includes('message')) return <MessageSquare size={10} className="inline mr-1" />;
    if (t.includes('email')) return <Mail size={10} className="inline mr-1" />;
    return null;
  };

  return (
    <div className="p-3 sm:p-3 lg:p-3">
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl  text-gray-900">Calendar</h1>
            <div className="flex items-center gap-2 text-xs  text-gray-600 mt-2">
              <button className="text-gray-600 hover:text-gray-900">Home</button>
              <span>›</span>
              <button className="text-gray-600 hover:text-gray-900">Applications</button>
              <span>›</span>
              <span>Calendar</span>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 p-2  bg-red-600 text-white rounded  hover:bg-red-700 transition-smooth   text-xs"
          >
            <Plus size={18} />
            New Event
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded  shadow-sm p-2 border border-border-light">
              <h3 className=" text-gray-900 mb-4">Event</h3>
              <p className="text-xs text-gray-600 mb-4">Drag and drop your event or click in the calendar to add event</p>
              
              <div className="space-y-2">
                {[
                  { name: 'Client Call', color: 'bg-teal-100' },
                  { name: 'Client Meeting', color: 'bg-blue-100' },
                  { name: 'Proposal Discussion', color: 'bg-indigo-100' },
                  { name: 'Deal Negotiation', color: 'bg-orange-100' },
                  { name: 'Payment Follow-Up', color: 'bg-green-100' },
                  { name: 'Internal Task', color: 'bg-pink-100' },
                  { name: 'Team Meeting', color: 'bg-purple-100' },
                  { name: 'Target Review', color: 'bg-yellow-100' },
                ].map((cat) => (
                  <div key={cat.name} className={`${cat.color} p-2 rounded text-xs   text-gray-700`}>
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>

            <UpcomingEvents />

            
          </div>

          <div className="lg:col-span-3 bg-white rounded  border border-border-light overflow-hidden">
            <div className="p-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleToday}
                    className="p-1 text-xs   text-gray-600 hover:bg-gray-100 rounded transition-smooth"
                  >
                    today
                  </button>
                </div>
                <h2 className="text-xl  text-gray-900">
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePrevMonth}
                    className="p-2 hover:bg-gray-100 rounded transition-smooth"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <button 
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 rounded transition-smooth"
                  >
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-0">
                {days.map(day => (
                  <div key={day} className="p-2 text-center  text-gray-900 text-xs  bg-gray-50 border-r border-b border-gray-200">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, idx) => (
                  <div 
                    key={idx}
                    className={`min-h-24 p-2 border-r border-b border-gray-200 text-xs  ${
                      day ? 'bg-white hover:bg-gray-50 transition-smooth' : 'bg-gray-50'
                    }`}
                  >
                    {day && (
                      <>
                        <div className=" text-gray-900 mb-1">{day}</div>
                        <div className="space-y-1">
                          {getEventsForDate(day).map(event => (
                            <div 
                              key={event.id}
                              className={`text-[10px] p-1 rounded group flex flex-col ${event.color}`}
                              title={`${event.relatedName ? `${event.relatedName}: ` : ''}${event.title}${event.type ? ` (${event.type})` : ''}`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center truncate flex-1">
                                  {getEventIcon(event.type)}
                                  <span className="truncate  text-gray-900">
                                    {event.relatedName || 'Event'}
                                  </span>
                                </div>
                                {event.meetingLink && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // Always use internal video call page for recording and AI analysis
                                      let code = event.meetingLink;
                                      if (event.meetingLink?.includes('meet.google.com/')) {
                                        code = event.meetingLink.split('meet.google.com/').pop().split('?')[0];
                                      } else if (event.meetingLink?.includes('zoom.us/')) {
                                        code = event.meetingLink.split('/').pop().split('?')[0];
                                      } else if (event.meetingLink?.includes('/')) {
                                        code = event.meetingLink.split('/').pop();
                                      }
                                      navigate(`/video-call/${code || event.id}`);
                                    }}
                                    className="ml-1 text-blue-600 hover:text-blue-800 transition-colors"
                                    title="Join Meeting"
                                  >
                                    <Video size={10} />
                                  </button>
                                )}
                              </div>
                              <div className="truncate text-gray-700 mt-0.5">
                                {event.title}
                              </div>
                              <div className="text-[9px] text-gray-500 ">
                                {event.type}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2 mt-4 p-2 bg-gray-50 rounded">
                <button className="p-2  text-xs    text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-smooth">month</button>
                <button className="p-2  text-xs    text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-smooth">week</button>
                <button className="p-2  text-xs    text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-smooth">day</button>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded   p-3  max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md text-gray-900">Add New Event</h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setFormData({ title: '', date: '', category: 'Client Call' });
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={15} />
              </button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="block text-xs    text-gray-700 mb-1">Event Name *</label>
                <input 
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter event name"
                  className="w-full p-2  border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-xs    text-gray-700 mb-1">Date *</label>
                <input 
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full p-2  border border-gray-300 rounded text-xs  focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-xs    text-gray-700 mb-1">Category *</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2  border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="Client Call">Client Call</option>
                  <option value="Client Meeting">Client Meeting</option>
                  <option value="Proposal Discussion">Proposal Discussion</option>
                  <option value="Deal Negotiation">Deal Negotiation</option>
                  <option value="Payment Follow-Up">Payment Follow-Up</option>
                  <option value="Internal Task">Internal Task</option>
                  <option value="Team Meeting">Team Meeting</option>
                  <option value="Target Review">Target Review</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => {
                    setShowModal(false);
                    setFormData({ title: '', date: '', category: 'Team Events' });
                  }}
                  className="flex-1 p-2 text-xs border border-gray-300 rounded  text-gray-700 hover:bg-gray-50 transition-smooth  "
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddEvent}
                  className="flex-1 p-2 text-xs bg-red-600 text-white rounded  hover:bg-red-700 transition-smooth  "
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
