import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Phone, Mail, Video } from 'lucide-react';

export default function CallHistoryPage() {
  const [callData, setCallData] = useState([]);
  const [selectedCaller, setSelectedCaller] = useState(null);
  const [sortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const fetchCallHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/call-history?limit=50');
      if (!response.ok) {
        throw new Error('Failed to fetch call history');
      }
      const data = await response.json();
      
      const mappedData = data.map((call) => ({
        id: call.id,
        name: call.caller_name,
        email: call.caller_email || 'N/A',
        avatar: call.caller_avatar || `https://ui-avatars.com/api/?name=${call.caller_name}&background=3B82F6&color=fff`,
        phone: call.phone_number || 'N/A',
        type: call.call_direction,
        callType: call.call_type,
        duration: call.duration > 0 ? `${String(Math.floor(call.duration / 60)).padStart(2, '0')}:${String(call.duration % 60).padStart(2, '0')}` : '00:00',
        date: new Date(call.created_at).toLocaleString(),
        totalCalls: 1,
        avgCallTime: call.duration > 0 ? `${String(Math.floor(call.duration / 60)).padStart(2, '0')}:${String(call.duration % 60).padStart(2, '0')}` : '00:00',
        avgWaitTime: '00:00',
        createdAt: call.created_at,
        meetingLink: call.meeting_link
      }));
      
      setCallData(mappedData);
      if (mappedData.length > 0) {
        setSelectedCaller(mappedData[0]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching call history:', err);
      setError('Failed to load call history');
      setCallData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCall = async (callId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/call-history/${callId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete call');
      }
      await fetchCallHistory();
    } catch (err) {
      console.error('Error deleting call:', err);
    }
  };

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

  const handleJoinMeeting = (meetingLink) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
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
          {loading ? (
            <div className="p-6 text-center text-gray-600">Loading call history...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Call Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Direction</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {callData.length > 0 ? (
                  callData.map((call) => (
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
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${call.callType === 'Video Call' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {call.callType === 'Video Call' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />} {call.callType}
                        </span>
                      </td>
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
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteCall(call.id); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No call history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
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
                <label className="text-xs font-semibold text-gray-500 uppercase">Call Type</label>
                <p className="text-lg font-bold text-gray-900">{selectedCaller.callType}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Direction</label>
                <p className="text-lg font-bold text-gray-900">{selectedCaller.type}</p>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-semibold text-gray-900">{selectedCaller.phone}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Duration</label>
                <p className="text-xl font-bold text-gray-900">{selectedCaller.duration}</p>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{selectedCaller.email}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Call Date</label>
                <p className="text-sm font-bold text-gray-900">{selectedCaller.date}</p>
              </div>
              {selectedCaller.meetingLink && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">Meeting Link</label>
                  <p className="text-xs font-mono text-blue-600 break-all">{selectedCaller.meetingLink}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {selectedCaller.meetingLink && (
              <button 
                onClick={() => handleJoinMeeting(selectedCaller.meetingLink)}
                className="w-full px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-semibold transition-colors">
                Join Meeting
              </button>
            )}
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors">
                Video Call
              </button>
              <button className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors">
                Audio Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
