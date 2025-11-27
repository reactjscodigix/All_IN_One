import React, { useState } from 'react';
import { Phone, Mic, MicOff, Volume2 } from 'lucide-react';

export default function AudioCallPage() {
  const [isMuted, setIsMuted] = useState(false);
  const caller = {
    name: 'Anthony Lewis',
    avatar: 'https://ui-avatars.com/api/?name=Anthony+Lewis&background=06B6D4&color=fff&size=200',
    status: 'Online',
    duration: '00:24',
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={caller.avatar}
            className="w-12 h-12 rounded-full object-cover"
            alt={caller.name}
          />
          <div>
            <h2 className="text-sm font-semibold text-gray-900">{caller.name}</h2>
            <p className="text-xs text-gray-500">{caller.status}</p>
          </div>
        </div>
        <button className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 1.5H3a2 2 0 00-2 2v4m6-4v4m0 0H1m9 0h12a2 2 0 012 2v4m0-4v4m0 0v8a2 2 0 01-2 2h-4m0-4h4m0 0V1.5" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-white via-gray-50 to-white">
        {/* Caller Avatar */}
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mb-6 shadow-lg">
          <img
            src={caller.avatar}
            className="w-full h-full rounded-full object-cover"
            alt={caller.name}
          />
        </div>

        {/* Caller Info */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{caller.name}</h3>
        <p className="text-lg text-blue-600 font-semibold mb-6">{caller.duration}</p>

        {/* Additional Info */}
        <div className="text-center mb-12">
          <p className="text-gray-600">Voice Call in progress</p>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="border-t p-6 flex items-center justify-center gap-6 bg-white">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
        </button>

        <button className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-all shadow-lg">
          <Phone className="w-7 h-7" />
        </button>

        <button className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all">
          <Volume2 className="w-7 h-7" />
        </button>
      </div>

      {/* Secondary Caller */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center gap-4">
        <img
          src="https://ui-avatars.com/api/?name=User&background=8B5CF6&color=fff&size=100"
          className="w-12 h-12 rounded-full object-cover"
          alt="Secondary"
        />
        <div>
          <p className="text-sm font-semibold text-gray-900">Second Caller Added</p>
          <p className="text-xs text-gray-600">Call on hold</p>
        </div>
      </div>
    </div>
  );
}
