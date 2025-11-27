import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 10));
  const [events] = useState([
    {
      id: 1,
      title: 'Meeting with Team Dev',
      date: new Date(2025, 10, 15),
      category: 'Team Events',
      color: 'bg-green-100 border-l-4 border-green-500'
    },
    {
      id: 2,
      title: 'Design System With Client',
      date: new Date(2025, 10, 24),
      category: 'Work',
      color: 'bg-yellow-100 border-l-4 border-yellow-500'
    },
    {
      id: 3,
      title: 'UI/UX Team Call',
      date: new Date(2025, 10, 28),
      category: 'Desgin',
      color: 'bg-blue-100 border-l-4 border-blue-500'
    },
  ]);
  const [showModal, setShowModal] = useState(false);

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

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <button className="text-gray-600 hover:text-gray-900">Home</button>
              <span>›</span>
              <button className="text-gray-600 hover:text-gray-900">Applications</button>
              <span>›</span>
              <span>Calendar</span>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-smooth font-medium"
          >
            <Plus size={18} />
            New Event
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border border-border-light">
              <h3 className="font-semibold text-gray-900 mb-4">Event</h3>
              <p className="text-xs text-gray-600 mb-4">Drag and drop your event or click in the calendar to add event</p>
              
              <div className="space-y-2">
                {[
                  { name: 'Team Events', color: 'bg-green-100' },
                  { name: 'Work', color: 'bg-yellow-100' },
                  { name: 'External', color: 'bg-pink-100' },
                  { name: 'Projects', color: 'bg-yellow-50' },
                  { name: 'Applications', color: 'bg-pink-100' },
                  { name: 'Desgin', color: 'bg-blue-100' },
                ].map((cat) => (
                  <div key={cat.name} className={`${cat.color} p-2 rounded text-xs font-medium text-gray-700`}>
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-4 border border-border-light">
              <h3 className="font-semibold text-gray-900 mb-4">Upcoming Event</h3>
              <div className="space-y-3">
                {events.slice(0, 3).map((event) => (
                  <div key={event.id} className="pb-3 border-b border-gray-200 last:border-0">
                    <p className="font-medium text-sm text-gray-900">{event.title}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {event.date.getDate()} {months[event.date.getMonth()]} {event.date.getFullYear()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black rounded-lg p-4 text-center text-white">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p className="font-semibold mb-2">Enjoy Unlimited Access on a small price monthly.</p>
              <button className="text-sm font-medium hover:underline">Upgrade Now</button>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border border-border-light overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleToday}
                    className="px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded transition-smooth"
                  >
                    today
                  </button>
                </div>
                <h2 className="text-xl font-bold text-gray-900">
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
                  <div key={day} className="p-3 text-center font-semibold text-gray-900 text-sm bg-gray-50 border-r border-b border-gray-200">
                    {day}
                  </div>
                ))}
                {calendarDays.map((day, idx) => (
                  <div 
                    key={idx}
                    className={`min-h-24 p-2 border-r border-b border-gray-200 text-sm ${
                      day ? 'bg-white hover:bg-gray-50 transition-smooth' : 'bg-gray-50'
                    }`}
                  >
                    {day && (
                      <>
                        <div className="font-semibold text-gray-900 mb-1">{day}</div>
                        <div className="space-y-1">
                          {getEventsForDate(day).map(event => (
                            <div 
                              key={event.id}
                              className={`text-xs p-1 rounded truncate ${event.color}`}
                            >
                              {event.title}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-smooth">month</button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-smooth">week</button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-smooth">day</button>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New Event</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input 
                type="text"
                placeholder="Event Name *"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input 
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                <option>Event Category *</option>
                <option>Team Events</option>
                <option>Work</option>
                <option>External</option>
              </select>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-smooth font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-smooth font-medium"
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
