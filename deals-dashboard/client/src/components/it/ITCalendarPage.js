import React, { useState, useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Plus, X, Check, Phone, Users, Flag,
  Settings, Briefcase, BookOpen, GitBranch, ClipboardList, Circle, Filter,
  List, LayoutGrid, Calendar, Clock, MapPin, User, AlignLeft, Tag, ChevronDown
} from 'lucide-react';

// ─── Event Data ───────────────────────────────────────────────────────────────
const CATEGORY_DEFS = [
  { label: 'Client Call', color: '#22c55e', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', Icon: Phone },
  { label: 'Client Meeting', color: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', Icon: Users },
  { label: 'Project Deadline', color: '#ef4444', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', Icon: Flag },
  { label: 'System Maintenance', color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', Icon: Settings },
  { label: 'Internal Task', color: '#8b5cf6', bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', Icon: ClipboardList },
  { label: 'Team Meeting', color: '#06b6d4', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', Icon: Users },
  { label: 'Training', color: '#f97316', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', Icon: BookOpen },
  { label: 'Release/Deployment', color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', Icon: GitBranch },
  { label: 'Review & Planning', color: '#ec4899', bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', Icon: Briefcase },
  { label: 'Other', color: '#94a3b8', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', Icon: Circle },
];

const getCat = (label) => CATEGORY_DEFS.find(c => c.label === label) || CATEGORY_DEFS[9];

// Events keyed by YYYY-MM-DD
const INITIAL_EVENTS = [];

const AVATARS = {
  'Emma Johnson': 'https://i.pravatar.cc/150?u=emma',
  'Michael Brown': 'https://i.pravatar.cc/150?u=michael',
  'Olivia Taylor': 'https://i.pravatar.cc/150?u=olivia',
  'Daniel Martinez': 'https://i.pravatar.cc/150?u=daniel',
  'Sophia Davis': 'https://i.pravatar.cc/150?u=sophia',
  'James Wilson': 'https://i.pravatar.cc/150?u=james',
};

const TODAY = new Date(2026, 6, 20); // July 20, 2026

const pad = n => String(n).padStart(2, '0');
const toKey = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Add Event Modal ──────────────────────────────────────────────────────────
function AddEventModal({ onClose, onSave, defaultDate }) {
  const [form, setForm] = useState({
    title: '', category: 'Team Meeting', date: defaultDate || toKey(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate()),
    startTime: '09:00 AM', endTime: '10:00 AM', location: '', description: '', attendees: '',
  });

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave({ ...form, id: Date.now(), attendees: form.attendees.split(',').map(s => s.trim()).filter(Boolean) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[16px]  text-gray-900">Add New Event</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fill in the details to schedule your event</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

          {/* Title */}
          <div>
            <label className="text-xs  text-gray-700 uppercase tracking-wider block mb-1.5">Event Title *</label>
            <input
              type="text" placeholder="e.g. Sprint Planning Meeting"
              value={form.title} onChange={e => set('title', e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs  text-gray-700 uppercase tracking-wider block mb-1.5"><Tag size={11} className="inline mr-1" />Category</label>
            <div className="relative">
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 appearance-none bg-white cursor-pointer">
                {CATEGORY_DEFS.map(c => <option key={c.label} value={c.label}>{c.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Date + Times */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs  text-gray-700 uppercase tracking-wider block mb-1.5"><Calendar size={11} className="inline mr-1" />Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white" />
            </div>
            <div>
              <label className="text-xs  text-gray-700 uppercase tracking-wider block mb-1.5"><Clock size={11} className="inline mr-1" />Start Time</label>
              <input type="time" onChange={e => {
                const [h, m] = e.target.value.split(':'); const hr = parseInt(h);
                set('startTime', `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`);
              }}
                className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white" />
            </div>
            <div>
              <label className="text-xs  text-gray-700 uppercase tracking-wider block mb-1.5"><Clock size={11} className="inline mr-1" />End Time</label>
              <input type="time" onChange={e => {
                const [h, m] = e.target.value.split(':'); const hr = parseInt(h);
                set('endTime', `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`);
              }}
                className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white" />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="text-xs  text-gray-700 uppercase tracking-wider block mb-1.5"><MapPin size={11} className="inline mr-1" />Location</label>
            <input type="text" placeholder="e.g. Meeting Room 2, Google Meet, Zoom..."
              value={form.location} onChange={e => set('location', e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all" />
          </div>

          {/* Attendees */}
          <div>
            <label className="text-xs  text-gray-700 uppercase tracking-wider block mb-1.5"><User size={11} className="inline mr-1" />Attendees (comma-separated)</label>
            <input type="text" placeholder="e.g. Emma Johnson, Michael Brown"
              value={form.attendees} onChange={e => set('attendees', e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all" />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs  text-gray-700 uppercase tracking-wider block mb-1.5"><AlignLeft size={11} className="inline mr-1" />Description</label>
            <textarea rows={3} placeholder="Brief description of the event..."
              value={form.description} onChange={e => set('description', e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 transition-all resize-none" />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="p-2 text-xs  text-gray-600 border border-gray-200 rounded hover:bg-white transition-colors">Cancel</button>
          <button onClick={handleSave}
            className="px-5 py-2 text-xs  bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-sm">
            <Check size={14} /> Save Event
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Event Detail Popup ───────────────────────────────────────────────────────
function EventDetail({ event, onClose }) {
  const cat = getCat(event.category);
  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className={`px-5 py-4 ${cat.bg} border-b ${cat.border} flex items-start justify-between`}>
          <div>
            <span className={`text-xs  uppercase tracking-wider ${cat.text}`}>{event.category}</span>
            <h3 className="text-[15px]  text-gray-900 mt-1">{event.title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 mt-0.5"><X size={16} /></button>
        </div>
        <div className="px-5 py-4 space-y-3 text-[12px] font-medium text-gray-600">
          <div className="flex items-center gap-2"><Calendar size={13} className="text-gray-400 shrink-0" />{event.date}</div>
          <div className="flex items-center gap-2"><Clock size={13} className="text-gray-400 shrink-0" />{event.startTime} – {event.endTime}</div>
          {event.location && <div className="flex items-center gap-2"><MapPin size={13} className="text-gray-400 shrink-0" />{event.location}</div>}
          {event.description && <div className="flex items-start gap-2"><AlignLeft size={13} className="text-gray-400 shrink-0 mt-0.5" />{event.description}</div>}
          {event.attendees?.length > 0 && (
            <div className="flex items-start gap-2">
              <Users size={13} className="text-gray-400 shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {event.attendees.map(a => (
                  <div key={a} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5">
                    {AVATARS[a] && <img src={AVATARS[a]} className="w-4 h-4 rounded-full" alt={a} />}
                    <span className="text-xs  text-gray-700">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ITCalendarPage() {
  const [viewYear, setViewYear] = useState(TODAY.getFullYear());
  const [viewMonth, setViewMonth] = useState(TODAY.getMonth());
  const [viewMode, setViewMode] = useState('Month');
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [addDefaultDate, setAddDefaultDate] = useState('');
  const [activeCategories, setActiveCategories] = useState(CATEGORY_DEFS.map(c => c.label));

  const toggleCategory = (label) => {
    setActiveCategories(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const filteredEvents = events.filter(e => activeCategories.includes(e.category));

  const eventsByDate = useMemo(() => {
    const map = {};
    filteredEvents.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [filteredEvents]);

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevDays = new Date(viewYear, viewMonth, 0).getDate();
    const cells = [];
    for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevDays - i, curMonth: false, date: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, curMonth: true, date: toKey(viewYear, viewMonth, d) });
    while (cells.length % 7 !== 0) cells.push({ day: cells.length - (firstDay + daysInMonth) + 1, curMonth: false, date: null });
    return cells;
  }, [viewYear, viewMonth]);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
  const goToday = () => { setViewMonth(TODAY.getMonth()); setViewYear(TODAY.getFullYear()); };

  const todayKey = toKey(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate());
  const todayEvents = eventsByDate[todayKey] || [];

  const upcomingEvents = useMemo(() => {
    return filteredEvents
      .filter(e => e.date >= todayKey)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 6);
  }, [filteredEvents, todayKey]);

  const handleAddEvent = (eventData) => {
    setEvents(prev => [...prev, eventData]);
  };

  const handleCellClick = (date) => {
    if (!date) return;
    setAddDefaultDate(date);
    setShowAddModal(true);
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-gray-900 flex" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Modals */}
      {showAddModal && <AddEventModal onClose={() => setShowAddModal(false)} onSave={handleAddEvent} defaultDate={addDefaultDate} />}
      {selectedEvent && <EventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />}

      {/* Left Sidebar */}
      <div className="w-[240px] shrink-0 bg-white border-r border-gray-100 p-4 space-y-6 overflow-y-auto" style={{ minHeight: '100vh' }}>

        {/* Event Categories */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[12px] font-extrabold text-gray-700 uppercase tracking-wider">Event Categories</h3>
            <button onClick={() => setShowAddModal(true)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-gray-500 transition-colors">
              <Plus size={14} />
            </button>
          </div>
          <div className="space-y-1">
            {CATEGORY_DEFS.map(cat => {
              const isActive = activeCategories.includes(cat.label);
              return (
                <button
                  key={cat.label}
                  onClick={() => toggleCategory(cat.label)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded text-[12px]  transition-all text-left
                    ${isActive ? `${cat.bg} ${cat.text}` : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <cat.Icon size={13} style={{ color: isActive ? cat.color : '#94a3b8' }} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[12px] font-extrabold text-gray-700 uppercase tracking-wider">Upcoming Events</h3>
            <button className="text-xs  text-blue-600 hover:text-blue-700">View All</button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map(ev => {
              const cat = getCat(ev.category);
              const d = new Date(ev.date + 'T00:00:00');
              return (
                <button key={ev.id} onClick={() => setSelectedEvent(ev)} className="w-full text-left flex gap-3 hover:bg-gray-50 rounded p-1.5 -mx-1.5 transition-colors">
                  <div className="shrink-0 text-center w-10">
                    <div className="text-[14px] font-black" style={{ color: cat.color }}>{d.getDate()}</div>
                    <div className="text-[9px]  text-gray-400 uppercase">{MONTH_NAMES[d.getMonth()].slice(0, 3)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px]  text-gray-800 truncate">{ev.title}</p>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{ev.startTime} – {ev.endTime}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="text-xs " style={{ color: cat.color }}>{ev.category}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 pb-0">

          {/* Page Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-[22px]  text-gray-900">IT Calendar</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage your schedule, events and team activities</p>
            </div>
            <button
              onClick={() => { setAddDefaultDate(todayKey); setShowAddModal(true); }}
              className="flex items-center gap-2 p-2.5 bg-red-600 text-white text-xs  rounded hover:bg-red-700 transition-colors shadow-sm"
            >
              <Plus size={16} /> New Event
            </button>
          </div>

          {/* Calendar Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button onClick={goToday} className="px-3 py-1.5 text-[12px]  border border-gray-200 rounded bg-white hover:bg-gray-50 shadow-sm transition-colors">Today</button>
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition-colors text-gray-600"><ChevronLeft size={15} /></button>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 bg-white hover:bg-gray-50 shadow-sm transition-colors text-gray-600"><ChevronRight size={15} /></button>
              <span className="text-[15px]  text-gray-900 ml-1">{MONTH_NAMES[viewMonth]} {viewYear}</span>
            </div>
            <div className="flex items-center gap-2">
              {['Month', 'Week', 'Day', 'List'].map(m => (
                <button key={m} onClick={() => setViewMode(m)}
                  className={`px-3 py-1.5 text-[12px]  rounded transition-colors border
                    ${viewMode === m ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                  {m}
                </button>
              ))}
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px]  rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 shadow-sm transition-colors ml-1">
                <Filter size={13} /> Filter
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="px-6 flex-1 overflow-y-auto pb-6">
          {viewMode === 'Month' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-gray-100">
                {DAY_NAMES.map(d => (
                  <div key={d} className="py-3 text-center text-xs font-extrabold text-gray-500 uppercase tracking-wider">{d}</div>
                ))}
              </div>
              {/* Day Cells */}
              <div className="grid grid-cols-7">
                {calendarDays.map((cell, idx) => {
                  const isToday = cell.date === todayKey;
                  const cellEvents = cell.date ? (eventsByDate[cell.date] || []) : [];
                  return (
                    <div
                      key={idx}
                      onClick={() => handleCellClick(cell.date)}
                      className={`min-h-[100px] p-2 border-b border-r border-gray-100 last:border-r-0 transition-colors cursor-pointer
                        ${!cell.curMonth ? 'bg-gray-50/60' : 'bg-white hover:bg-blue-50/20'}
                        ${(idx + 1) % 7 === 0 ? 'border-r-0' : ''}`}
                    >
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full text-[12px]  mb-1.5 transition-colors
                        ${isToday ? 'bg-red-600 text-white shadow-sm' : cell.curMonth ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300'}`}>
                        {cell.day}
                      </div>
                      <div className="space-y-0.5">
                        {cellEvents.slice(0, 2).map(ev => {
                          const cat = getCat(ev.category);
                          return (
                            <div
                              key={ev.id}
                              onClick={e => { e.stopPropagation(); setSelectedEvent(ev); }}
                              className={`px-1.5 py-0.5 rounded text-[9px]  truncate cursor-pointer hover:opacity-80 transition-opacity ${cat.bg} ${cat.text}`}
                            >
                              <span className="font-black mr-1">{ev.startTime}</span>{ev.title}
                            </div>
                          );
                        })}
                        {cellEvents.length > 2 && (
                          <div className="text-[9px]  text-gray-400 pl-1">+{cellEvents.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'List' && (
            <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-[14px]  text-gray-900">Events in {MONTH_NAMES[viewMonth]} {viewYear}</h3>
              </div>
              {Object.entries(eventsByDate)
                .filter(([date]) => date.startsWith(`${viewYear}-${pad(viewMonth + 1)}`))
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, evs]) => (
                  <div key={date}>
                    <div className="p-2 bg-gray-50 border-b border-gray-100 text-xs  text-gray-500 uppercase">
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    {evs.map(ev => {
                      const cat = getCat(ev.category);
                      return (
                        <div key={ev.id} onClick={() => setSelectedEvent(ev)}
                          className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer flex items-center gap-4 transition-colors">
                          <div className={`w-1 h-10 rounded-full shrink-0`} style={{ background: cat.color }} />
                          <div className="flex-1">
                            <p className="text-xs  text-gray-800">{ev.title}</p>
                            <p className="text-xs text-gray-500 font-medium">{ev.startTime} – {ev.endTime} {ev.location ? `• ${ev.location}` : ''}</p>
                          </div>
                          <span className={`text-xs  px-2 py-1 rounded ${cat.bg} ${cat.text}`}>{ev.category}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
            </div>
          )}

          {(viewMode === 'Week' || viewMode === 'Day') && (
            <div className="bg-white rounded border border-gray-200 shadow-sm p-6 flex items-center justify-center min-h-[400px]">
              <div className="text-center text-gray-400">
                <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-[14px] ">{viewMode} view — switch to Month or List</p>
              </div>
            </div>
          )}

          {/* Today's Schedule */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px]  text-gray-900">
                Today's Schedule – <span className="text-red-500">
                  {TODAY.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </h3>
              <button className="text-[12px]  text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View Full Schedule <ChevronRight size={13} />
              </button>
            </div>
            {todayEvents.length === 0 ? (
              <div className="bg-white rounded border border-gray-100 shadow-sm p-6 text-center text-gray-400">
                <Calendar size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs ">No events scheduled for today</p>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                {todayEvents.map(ev => {
                  const cat = getCat(ev.category);
                  return (
                    <button key={ev.id} onClick={() => setSelectedEvent(ev)}
                      className="bg-white rounded border border-gray-100 shadow-sm p-4 text-left hover:shadow-md hover:border-blue-200 transition-all group">
                      <div className={`w-8 h-8 rounded ${cat.bg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                        <cat.Icon size={16} style={{ color: cat.color }} />
                      </div>
                      <p className="text-xs  text-gray-800 mb-1 line-clamp-2">{ev.title}</p>
                      <p className="text-xs  text-gray-500 mb-1">{ev.startTime} – {ev.endTime}</p>
                      {ev.location && <p className="text-xs text-gray-400 font-medium mb-2">{ev.location}</p>}
                      <div className="flex items-center gap-1">
                        {ev.attendees.slice(0, 3).map(a => (
                          AVATARS[a] ? (
                            <img key={a} src={AVATARS[a]} className="w-5 h-5 rounded-full border border-white -ml-1 first:ml-0" alt={a} />
                          ) : null
                        ))}
                        {ev.attendees.length > 3 && (
                          <span className="text-[9px]  text-gray-400 ml-1">+{ev.attendees.length - 3}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
