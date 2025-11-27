import React, { useState } from 'react';
import { Eye, Trash2, Phone, Mail } from 'lucide-react';

const CALL_DATA = [
  {
    id: 1,
    name: 'Anthony Lewis',
    email: 'anthony@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Anthony+Lewis&background=FF6B6B&color=fff',
    phone: '(123) 4567 890',
    type: 'Incoming',
    duration: '00.25',
    date: '14 Jan 2024, 04:27 AM',
    totalCalls: 20,
    avgCallTime: '00:30',
    avgWaitTime: '00:05',
  },
  {
    id: 2,
    name: 'Brian Villalobos',
    email: 'brian@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Brian+Villalobos&background=4F46E5&color=fff',
    phone: '(179) 7382 829',
    type: 'Outgoing',
    duration: '00.10',
    date: '21 Jan 2024, 03:19 AM',
    totalCalls: 15,
    avgCallTime: '00:20',
    avgWaitTime: '00:03',
  },
  {
    id: 3,
    name: 'Harvey Smith',
    email: 'harvey@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Harvey+Smith&background=8B5CF6&color=fff',
    phone: '(184) 2719 738',
    type: 'Incoming',
    duration: '00.40',
    date: '20 Feb 2024, 12:15 PM',
    totalCalls: 25,
    avgCallTime: '00:45',
    avgWaitTime: '00:08',
  },
  {
    id: 4,
    name: 'Peral',
    email: 'peral@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Peral&background=EC4899&color=fff',
    phone: '(193) 7839 748',
    type: 'Missed Call',
    duration: '00.00',
    date: '15 Mar 2024, 12:11 AM',
    totalCalls: 8,
    avgCallTime: '00:15',
    avgWaitTime: '00:02',
  },
  {
    id: 5,
    name: 'Douglas Martini',
    email: 'martniwr@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Douglas+Martini&background=10B981&color=fff',
    phone: '(183) 9302 890',
    type: 'Outgoing',
    duration: '00.35',
    date: '12 Apr 2024, 05:48 PM',
    totalCalls: 18,
    avgCallTime: '00:35',
    avgWaitTime: '00:05',
  },
  {
    id: 6,
    name: 'Linda Ray',
    email: 'ray456@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Linda+Ray&background=06B6D4&color=fff',
    phone: '(120) 3728 039',
    type: 'Incoming',
    duration: '01.40',
    date: '20 Apr 2024, 06:11 PM',
    totalCalls: 30,
    avgCallTime: '01:00',
    avgWaitTime: '00:10',
  },
];

export default function CallHistoryPage() {
  const [selectedCaller, setSelectedCaller] = useState(CALL_DATA[0]);
  const [sortBy] = useState('newest');

  const getTypeColor = (type) => {
    switch (type) {
      case 'Incoming':
        return 'bg-green-50 text-green-700';
      case 'Outgoing':
        return 'bg-blue-50 text-blue-700';
      case 'Missed Call':
        return 'bg-red-50 text-red-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Incoming':
        return '↓';
      case 'Outgoing':
        return '↗';
      case 'Missed Call':
        return '✕';
      default:
        return '○';
    }
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-white flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Call History</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Home</span>
            <span>/</span>
            <span>Applications</span>
            <span>/</span>
            <span className="text-gray-900 font-semibold">Call History</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
              📅 27 Nov 25 - 27 Nov 25
            </div>
          </div>
          <div className="relative">
            <button className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-2">
              📊 Sort By : {sortBy === 'newest' ? 'Newest' : 'Oldest'}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Call Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {CALL_DATA.map((call) => (
                <tr key={call.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedCaller(call)}>
                  <td className="px-6 py-4">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={call.avatar} className="w-10 h-10 rounded-full object-cover" alt={call.name} />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{call.name}</p>
                        <p className="text-xs text-gray-500">{call.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{call.phone}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${getTypeColor(call.type)}`}>
                      {getTypeIcon(call.type)} {call.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{call.duration}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{call.date}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-blue-600">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sidebar - Caller Details */}
      {selectedCaller && (
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Caller Details</h3>

          {/* Caller Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 mb-6">
            <div className="flex justify-center mb-4">
              <img src={selectedCaller.avatar} className="w-20 h-20 rounded-full object-cover" alt={selectedCaller.name} />
            </div>
            <h4 className="text-center font-bold text-gray-900 mb-6 text-lg">{selectedCaller.name}</h4>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Total Calls</label>
                <p className="text-2xl font-bold text-gray-900">{selectedCaller.totalCalls}</p>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">{selectedCaller.phone}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Average Call Timing</label>
                <p className="text-xl font-bold text-gray-900">{selectedCaller.avgCallTime}</p>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{selectedCaller.email}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Average Waiting Time</label>
                <p className="text-xl font-bold text-gray-900">{selectedCaller.avgWaitTime}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors">
              Video Call
            </button>
            <button className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors">
              Audio Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
