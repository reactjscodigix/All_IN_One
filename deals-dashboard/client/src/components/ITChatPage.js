import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Send, Phone, Video, MoreVertical, X, 
  UserPlus, MessageCircle, Users, Shield, Plus,
  Info, Settings, Hash
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { conversationsAPI, usersAPI } from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

export default function ITChatPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentMessages, setCurrentMessages] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fetchConversations();
      fetchAvailableUsers();
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  useEffect(() => {
    if (selectedChat && user?.id) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedChat, user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [currentMessages]);

  const fetchConversations = async () => {
    try {
      const data = await conversationsAPI.getByUserId(user?.id);
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedChat || !user?.id) return;
    try {
      const isGroup = selectedChat.chat_type === 'group';
      const data = await conversationsAPI.getMessagesByUserId(
        user?.id, 
        isGroup ? null : (selectedChat.other_user_id || selectedChat.id),
        isGroup ? selectedChat.id : null
      );
      setCurrentMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setAvailableUsers(data.filter(u => u.id !== user?.id));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || !user?.id) return;

    try {
      const isGroup = selectedChat.chat_type === 'group';
      await conversationsAPI.sendMessage({
        sender_id: user?.id,
        receiver_id: isGroup ? null : (selectedChat.other_user_id || selectedChat.id),
        group_id: isGroup ? selectedChat.id : null,
        message_text: messageInput,
      });

      setMessageInput('');
      fetchMessages();
    } catch (error) {
      showErrorToast('Failed to send message');
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim() || selectedMembers.length === 0) {
      showErrorToast('Please provide a group name and select at least one member');
      return;
    }

    try {
      setLoading(true);
      await conversationsAPI.createGroup({
        name: newGroupName,
        created_by: user?.id,
        members: selectedMembers
      });
      
      showSuccessToast('Team chat created successfully');
      setShowCreateGroup(false);
      setNewGroupName('');
      setSelectedMembers([]);
      fetchConversations();
    } catch (error) {
      showErrorToast('Failed to create team chat');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (userId) => {
    setSelectedMembers(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-50 overflow-hidden">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl  text-gray-900">IT Collab</h1>
            <button 
              onClick={() => setShowCreateGroup(true)}
              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              title="Create Team Chat"
            >
              <UserPlus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((chat) => (
            <div
              key={`${chat.chat_type}-${chat.id}`}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 border-b border-gray-50 cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedChat?.id === chat.id && selectedChat?.chat_type === chat.chat_type ? 'bg-red-50/50 border-l-4 border-red-500' : ''
              }`}
            >
              <div className="flex gap-3">
                <div className="relative flex-shrink-0">
                  {chat.chat_type === 'group' ? (
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                      <Users size={24} />
                    </div>
                  ) : (
                    <>
                      <img src={chat.avatar || `https://ui-avatars.com/api/?name=${chat.name}`} className="w-12 h-12 rounded-xl object-cover" alt="" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    </>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-sm  text-gray-900 truncate">{chat.name}</h3>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{chat.timestamp?.split(' ')[1]}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{chat.lastMessage || 'No messages yet'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedChat.chat_type === 'group' ? (
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Hash size={20} />
                  </div>
                ) : (
                  <img src={selectedChat.avatar || `https://ui-avatars.com/api/?name=${selectedChat.name}`} className="w-10 h-10 rounded-lg object-cover" alt="" />
                )}
                <div>
                  <h2 className="text-sm  text-gray-900">{selectedChat.name}</h2>
                  <p className="text-[10px] text-green-500 font-medium uppercase tracking-wider">
                    {selectedChat.chat_type === 'group' ? 'Team Channel' : 'Active Now'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"><Phone size={20} /></button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"><Video size={20} /></button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg"><Info size={20} /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
              {currentMessages.map((msg, i) => {
                const isMe = msg.sender_id === user?.id;
                return (
                  <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && (
                        <img 
                          src={msg.sender_avatar || `https://ui-avatars.com/api/?name=${msg.first_name}`} 
                          className="w-8 h-8 rounded-lg mt-auto" 
                          alt="" 
                        />
                      )}
                      <div>
                        {!isMe && selectedChat.chat_type === 'group' && (
                          <span className="text-xs  text-gray-400 ml-1 mb-1 block">
                            {msg.first_name} {msg.last_name}
                          </span>
                        )}
                        <div className={`p-3 rounded-2xl shadow-sm ${
                          isMe ? 'bg-red-600 text-white rounded-tr-none' : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        </div>
                        <span className={`text-[10px] text-gray-400 mt-1 block ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
                <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Plus size={20} /></button>
                <input 
                  type="text"
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
              <MessageCircle size={40} />
            </div>
            <h2 className="text-xl  text-gray-900 mb-2">Welcome to IT Collaboration</h2>
            <p className="text-gray-500 max-w-sm">Select a team channel or individual to start communicating with your department.</p>
            <button 
              onClick={() => setShowCreateGroup(true)}
              className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg  shadow-md hover:bg-red-700 transition-all flex items-center gap-2"
            >
              <UserPlus size={18} /> Create Team Chat
            </button>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg  text-gray-900">Create New Team Chat</h3>
              <button onClick={() => setShowCreateGroup(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs  text-gray-500 uppercase tracking-wider mb-2">Group Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Infrastructure Team, DevOps..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>
              <div>
                <label className="block text-xs  text-gray-500 uppercase tracking-wider mb-2">Add Team Members</label>
                <div className="max-h-60 overflow-y-auto space-y-1 p-1 bg-gray-50 rounded-lg border border-gray-200">
                  {availableUsers.map(u => (
                    <div 
                      key={u.id}
                      onClick={() => toggleMember(u.id)}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${
                        selectedMembers.includes(u.id) ? 'bg-red-50 text-red-700' : 'hover:bg-white'
                      }`}
                    >
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.first_name}`} className="w-8 h-8 rounded-lg object-cover" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs  truncate">{u.first_name} {u.last_name}</p>
                        <p className="text-[10px] opacity-70 truncate">{u.department || 'No Department'}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedMembers.includes(u.id) ? 'bg-red-500 border-red-500' : 'border-gray-300'
                      }`}>
                        {selectedMembers.includes(u.id) && <Plus size={10} className="text-white rotate-45" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button 
                onClick={() => setShowCreateGroup(false)}
                className="flex-1 py-2 text-sm  text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateGroup}
                disabled={loading || !newGroupName.trim() || selectedMembers.length === 0}
                className="flex-1 py-2 text-sm  bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-all shadow-md"
              >
                {loading ? 'Creating...' : 'Create Chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
