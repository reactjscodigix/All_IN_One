import React, { useState, useEffect } from 'react';
import { Phone, Mic, MicOff, Video, VideoOff, Monitor, Volume2, RotateCcw, Settings } from 'lucide-react';
import { generateMeetingLink } from '../utils/meetingUtils';

export default function VideoCallPage() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [googleMeetLink, setGoogleMeetLink] = useState('');
  const callTime = '40:12';
  const callerName = 'Joe Lewis';

  useEffect(() => {
    setGoogleMeetLink(generateMeetingLink());
  }, []);

  const recordCall = async (meetingLink) => {
    try {
      const response = await fetch('http://localhost:5000/api/call-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          caller_name: callerName,
          call_type: 'Video Call',
          call_direction: 'Outgoing',
          duration: 0,
          meeting_link: meetingLink,
          notes: 'Video call via Google Meet'
        })
      });
      return response;
    } catch (error) {
      console.error('Error recording call:', error);
    }
  };

  const handleCallClick = async () => {
    if (googleMeetLink) {
      await recordCall(googleMeetLink);
      window.open(googleMeetLink, '_blank');
    }
  };

  return (
    <div className="w-full h-[calc(100vh-80px)] bg-gray-900 flex items-center justify-center relative overflow-hidden">
      <div className="relative w-full h-full bg-cover bg-center" style={{
        backgroundImage: 'url("https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=800&fit=crop")',
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>

        <div className="relative w-full h-full flex flex-col">
          {/* Top Controls */}
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">{callTime}</span>
              </div>
            </div>

            <div className="text-white text-center">
              <h2 className="text-2xl font-bold">{callerName}</h2>
              <p className="text-sm text-gray-300">Video Call</p>
            </div>

            <div></div>
          </div>

          {/* Remote Video - Large */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full h-full relative"></div>
          </div>

          {/* Local Video - PiP */}
          <div className="absolute bottom-24 right-8 w-48 h-40 bg-gray-800 border-4 border-white rounded-2xl overflow-hidden shadow-lg">
            <img
              src="https://ui-avatars.com/api/?name=You&background=3B82F6&color=fff&size=200"
              className="w-full h-full object-cover"
              alt="Local video"
            />
          </div>

          {/* Bottom Controls */}
          <div className="bg-black bg-opacity-60 backdrop-blur-md p-6 flex items-center justify-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
              } text-white`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                !isVideoOn ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'
              } text-white`}
            >
              {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>

            <button className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white transition-all">
              <Monitor className="w-6 h-6" />
            </button>

            <button className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white transition-all">
              <Volume2 className="w-6 h-6" />
            </button>

            <button 
              onClick={handleCallClick}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-all ml-4">
              <Phone className="w-6 h-6" />
            </button>

            <button className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white transition-all">
              <RotateCcw className="w-6 h-6" />
            </button>

            <button className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 text-white transition-all">
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
