import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Send, Phone, Video, MoreVertical, X, Check, CheckCheck } from 'lucide-react';

const CHATS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=FF6B6B&color=fff',
    lastMessage: 'That sounds great! Let me check with the team.',
    timestamp: '2:30 PM',
    unread: 2,
    status: 'online',
    statusDot: 'bg-green-500',
  },
  {
    id: 2,
    name: 'Michael Chen',
    avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=4F46E5&color=fff',
    lastMessage: 'Can we schedule a meeting tomorrow?',
    timestamp: '1:15 PM',
    unread: 0,
    status: 'online',
    statusDot: 'bg-green-500',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=8B5CF6&color=fff',
    lastMessage: 'Perfect! I\'ll send you the documents.',
    timestamp: 'Yesterday',
    unread: 0,
    status: 'offline',
    statusDot: 'bg-gray-400',
  },
  {
    id: 4,
    name: 'James Wilson',
    avatar: 'https://ui-avatars.com/api/?name=James+Wilson&background=06B6D4&color=fff',
    lastMessage: 'Thanks for the update!',
    timestamp: 'Yesterday',
    unread: 0,
    status: 'away',
    statusDot: 'bg-yellow-500',
  },
];

const CONVERSATIONS = {
  1: [
    { id: 1, sender: 'other', text: 'Hi! How are you doing?', timestamp: '2:10 PM' },
    { id: 2, sender: 'user', text: 'Hey Sarah! I\'m good, thanks for asking. How about you?', timestamp: '2:12 PM', status: 'read' },
    { id: 3, sender: 'other', text: 'Doing well! Did you see the proposal I sent?', timestamp: '2:15 PM' },
    { id: 4, sender: 'user', text: 'Yes, I reviewed it. Some great points there.', timestamp: '2:20 PM', status: 'read' },
    { id: 5, sender: 'user', text: 'Can we discuss the timeline?', timestamp: '2:22 PM', status: 'read' },
    { id: 6, sender: 'other', text: 'That sounds great! Let me check with the team.', timestamp: '2:30 PM' },
  ],
  2: [
    { id: 1, sender: 'other', text: 'Hey, do you have a moment?', timestamp: '12:45 PM' },
    { id: 2, sender: 'user', text: 'Sure! What\'s up?', timestamp: '12:50 PM', status: 'read' },
    { id: 3, sender: 'other', text: 'Can we schedule a meeting tomorrow?', timestamp: '1:15 PM' },
  ],
};

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const filteredChats = CHATS.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentChat = selectedChat ? CHATS.find(c => c.id === selectedChat) : null;
  
  const currentMessages = useMemo(() => 
    selectedChat && CONVERSATIONS[selectedChat] ? CONVERSATIONS[selectedChat] : [], 
    [selectedChat]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      setMessageInput('');
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* LEFT SIDEBAR - Chat List */}
      <div className="w-72 flex flex-col bg-white border-r border-gray-200 shadow-sm">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white text-sm text-gray-700 placeholder-gray-400 transition-all"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-1 p-3">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                  selectedChat === chat.id ? 'bg-red-50 border border-red-100' : 'border border-transparent hover:border-gray-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar with status */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-12 h-12 rounded-full ring-2 ring-white object-cover"
                    />
                    <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 ${chat.statusDot} rounded-full border-2 border-white`} />
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{chat.name}</h3>
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{chat.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                  </div>

                  {/* Unread Badge */}
                  {chat.unread > 0 && (
                    <div className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {chat.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - Conversation */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="border-b border-gray-100 bg-white shadow-sm px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <img
                    src={currentChat.avatar}
                    alt={currentChat.name}
                    className="w-10 h-10 rounded-full ring-2 ring-white object-cover"
                  />
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 ${currentChat.statusDot} rounded-full border border-white`} />
                </div>

                {/* User Info */}
                <div>
                  <h2 className="text-sm font-semibold text-gray-900">{currentChat.name}</h2>
                  <p className="text-xs text-gray-500 capitalize">{currentChat.status}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button className="p-2.5 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 hover:text-red-500">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2.5 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 hover:text-red-500">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2.5 hover:bg-gray-50 rounded-lg transition-colors text-gray-600 hover:text-red-500">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-white via-gray-50 to-white">
            {currentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-red-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-900 rounded-bl-none'
                  } shadow-sm`}
                >
                  <p className="text-sm break-words">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sender === 'user' ? 'text-red-100' : 'text-gray-500'}`}>
                    <span className="text-xs">{msg.timestamp}</span>
                    {msg.status === 'read' && <CheckCheck className="w-3.5 h-3.5" />}
                    {msg.status === 'sent' && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 px-4 py-2.5 rounded-lg rounded-bl-none shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Composer */}
          <div className="border-t border-gray-100 bg-white px-6 py-4 shadow-lg">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white text-sm text-gray-900 placeholder-gray-400 transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all ${
                  messageInput.trim()
                    ? 'bg-red-500 hover:bg-red-600 text-white cursor-pointer shadow-md hover:shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No chat selected</h3>
            <p className="text-sm text-gray-500">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
}
