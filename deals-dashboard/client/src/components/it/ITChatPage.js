import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Send, Phone, Video, MoreHorizontal, X, Plus, Filter,
  Star, Paperclip, Smile, AtSign, Hash, Calendar, FileText,
  ThumbsUp, Download, ChevronRight, Bell, Users, Settings,
  Mic, Image, Link, Check, CheckCheck, Pin, Edit3, LogOut
} from 'lucide-react';

const CURRENT_USER_ID = 1;

export default function ITChatPage() {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const EMOJIS = ['😀', '😂', '😍', '👍', '🙏', '🔥', '🎉', '❤️', '🤔', '🙌', '😢', '👏', '👀', '💯', '✨'];
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('Messages');
  const [showDetails, setShowDetails] = useState(true);
  const messagesEndRef = useRef(null);

  const [availableUsers, setAvailableUsers] = useState([]);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [teamMemberSearch, setTeamMemberSearch] = useState('');

  const FILTER_TABS = ['All', 'Unread', 'Direct', 'Groups'];
  const TABS = ['Messages', 'Files', 'Links', 'Tasks'];

  const FILE_ICONS = {
    'pdf': <FileText size={22} className="text-red-500" />,
    'zip': <FileText size={22} className="text-blue-500" />,
    'png': <Image size={22} className="text-green-500" />
  };

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`/api/conversations/${CURRENT_USER_ID}`);
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const res = await axios.get(`/api/available-users/${CURRENT_USER_ID}`);
      setAvailableUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchAvailableUsers();
  }, []);

  const fetchMessages = async (chat) => {
    try {
      const isGroup = chat.chat_type === 'group';
      const endpoint = isGroup
        ? `/api/messages/${CURRENT_USER_ID}?groupId=${chat.id}`
        : `/api/messages/${CURRENT_USER_ID}?conversationWith=${chat.other_user_id}`;
      const res = await axios.get(endpoint);
      setMessages(res.data);

      if (isGroup) {
        const membersRes = await axios.get(`/api/chat-groups/${chat.id}/members`);
        setGroupMembers(membersRes.data);
      } else {
        setGroupMembers([]);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
      const interval = setInterval(() => fetchMessages(selectedChat), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setActiveTab('Messages');
  };

  
  const handleIconClick = (action) => {
    if (action === 'smile') setShowEmojiPicker(!showEmojiPicker);
    if (action === 'paperclip') fileInputRef.current?.click();
    if (action === 'image') imageInputRef.current?.click();
    if (action === 'atsign') { setInput(prev => prev + '@'); document.getElementById('chat-input')?.focus(); }
    if (action === 'hash') { setInput(prev => prev + '#'); document.getElementById('chat-input')?.focus(); }
    if (action === 'calendar') { setInput(prev => prev + '📅 [Schedule a meeting] '); document.getElementById('chat-input')?.focus(); }
    if (action === 'mic') { setInput(prev => prev + '🎤 [Voice note] '); document.getElementById('chat-input')?.focus(); }
    if (action === 'plus') { setInput(prev => prev + '➕ '); document.getElementById('chat-input')?.focus(); }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setAttachedFile(file);
    e.target.value = null; // reset
  };

  const handleSend = async () => {
    let textToSend = input.trim();
    if (attachedFile) {
      textToSend += (textToSend ? '\n' : '') + `[Attached File: ${attachedFile.name}]`;
    }
    if (!textToSend && !attachedFile) return;
    if (!selectedChat) return;
    try {
      const isGroup = selectedChat.chat_type === 'group';
      const payload = {
        sender_id: CURRENT_USER_ID,
        message_text: textToSend,
      };
      if (isGroup) {
        payload.group_id = selectedChat.id;
      } else {
        payload.receiver_id = selectedChat.other_user_id;
      }

      await axios.post('/api/messages', payload);
      setInput(''); setAttachedFile(null); setShowEmojiPicker(false);
      fetchMessages(selectedChat);
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim() || selectedUserIds.length === 0) return;
    try {
      const payload = {
        name: newTeamName,
        description: newTeamDesc,
        created_by: CURRENT_USER_ID,
        members: selectedUserIds
      };
      await axios.post('/api/chat-groups', payload);
      setIsCreateTeamOpen(false);
      setNewTeamName('');
      setNewTeamDesc('');
      setSelectedUserIds([]);
      fetchConversations();
    } catch (err) {
      console.error('Failed to create team', err);
    }
  };

  const handleAddMembers = async () => {
    if (!selectedChat || selectedChat.chat_type !== 'group' || selectedUserIds.length === 0) return;
    try {
      await axios.post(`/api/chat-groups/${selectedChat.id}/members`, {
        members: selectedUserIds
      });
      setIsAddMemberOpen(false);
      setSelectedUserIds([]);
      fetchMessages(selectedChat);
    } catch (err) {
      console.error('Failed to add members', err);
    }
  };

  const toggleUserSelection = (id) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };

  const isEmployeeSearch = searchTerm.toLowerCase().trim() === 'employee';

  const filteredChats = conversations.filter(c => {
    if (isEmployeeSearch) return true;
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || (c.lastMessage || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (activeFilter === 'Direct') return matchSearch && c.chat_type === 'direct';
    if (activeFilter === 'Groups') return matchSearch && c.chat_type === 'group';
    if (activeFilter === 'Unread') return matchSearch && false;
    return matchSearch;
  });

  const pinned = filteredChats.filter(c => c.pinned);
  const recent = filteredChats.filter(c => !c.pinned);

  const directoryUsers = searchTerm.trim() 
    ? availableUsers.filter(u => 
        (isEmployeeSearch || (u.name || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
        !recent.some(c => c.other_user_id === u.id) &&
        !pinned.some(c => c.other_user_id === u.id)
      ).map(u => ({
        id: `dummy-${u.id}`,
        chat_type: 'private',
        other_user_id: u.id,
        name: u.name || '',
        avatar: u.avatar || '',
        status: u.status || 'Active',
        lastMessage: 'Start a new conversation'
      }))
    : [];

  const groupInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'GR';

  const renderMessage = (msg, idx) => {
    const isMine = msg.sender === 'user';
    const senderName = isMine ? 'You' : `${msg.first_name} ${msg.last_name}`;
    const avatarUrl = msg.sender_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random`;

    return (
      <React.Fragment key={msg.id || idx}>
        {msg.date && (
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className={`text-xs px-3 py-1 rounded-full ${msg.date === 'New Messages' ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500'}`}>{msg.date}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
        )}
        <div className={`flex gap-3 px-5 py-1.5 hover:bg-gray-50/80 group ${isMine ? 'flex-row-reverse' : ''}`}>
          {!isMine && <Avatar name={senderName} src={avatarUrl} size={34} />}
          <div className={`max-w-[65%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
            {!isMine && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] text-gray-900">{senderName}</span>
                <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{'Member'}</span>
                <span className="text-xs text-gray-400 font-medium">{msg.timestamp}</span>
              </div>
            )}
            <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap
              ${isMine ? 'bg-red-600 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm'}`}>
              {msg.text}
            </div>
            {msg.file && (
              <div className={`mt-2 flex items-center gap-2.5 p-3 rounded border border-gray-100 bg-white shadow-sm`}>
                {FILE_ICONS[msg.file.icon] || <FileText size={22} className="text-gray-400" />}
                <div>
                  <p className="text-[12px] text-gray-800">{msg.file.name}</p>
                  <p className="text-xs text-gray-400 font-medium">{msg.file.size}</p>
                </div>
                <button className="ml-4 text-gray-400 hover:text-blue-600 transition-colors"><Download size={15} /></button>
              </div>
            )}
            {isMine && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-400">{msg.timestamp}</span>
                <CheckCheck size={12} className="text-blue-500" />
              </div>
            )}
          </div>
          <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 self-center ${isMine ? 'mr-2' : 'ml-2'}`}>
            <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400"><Smile size={12} /></button>
            <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400"><MoreHorizontal size={12} /></button>
          </div>
        </div>
      </React.Fragment>
    );
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-gray-900 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Left Panel: Chat List ─────────────────────────────────────────── */}
      <div className="w-[280px] shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] text-gray-900">Team Chat</h2>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
          </div>
          <button onClick={() => setIsCreateTeamOpen(true)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"><Edit3 size={14} /></button>
        </div>

        {/* Filter Tabs */}
        <div className="px-3 pt-3 border-b border-gray-100">
          <div className="flex gap-3">
            {FILTER_TABS.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`p-2  text-sm  transition-colors
                  ${activeFilter === f ? 'text-red-600 border-b-2 border-red-500' : 'text-gray-500 hover:text-gray-700'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search chats..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-8 py-2 bg-gray-50 border border-gray-100 rounded text-[12px] focus:outline-none focus:border-blue-300 transition-colors" />
            <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><Filter size={12} /></button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2">
          {pinned.length > 0 && (
            <>
              <div className="flex items-center justify-between p-2 mb-1">
                <span className="text-xs  text-amber-500 uppercase tracking-wider flex items-center gap-1"><Pin size={10} /> Pinned</span>
                <button className="text-gray-400 hover:text-gray-600"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6" /></svg></button>
              </div>
              {pinned.map(chat => <ChatItem key={chat.id} chat={chat} selected={selectedChat?.id === chat.id} onSelect={handleSelectChat} groupInitials={groupInitials} />)}
            </>
          )}
          {recent.length > 0 && (
            <>
              <div className="flex items-center justify-between p-2 mb-1 mt-2">
                <span className="text-xs  text-gray-400 uppercase tracking-wider">Recent</span>
                <button className="text-gray-400 hover:text-gray-600"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6" /></svg></button>
              </div>
              {recent.map(chat => <ChatItem key={chat.id} chat={chat} selected={selectedChat?.id === chat.id} onSelect={handleSelectChat} groupInitials={groupInitials} />)}
            </>
          )}
          {directoryUsers.length > 0 && (
            <>
              <div className="flex items-center justify-between p-2 mb-1 mt-2 border-t border-gray-100 pt-2">
                <span className="text-xs  text-blue-500 uppercase tracking-wider flex items-center gap-1"><Users size={10} /> Company Directory</span>
              </div>
              {directoryUsers.map(chat => <ChatItem key={chat.id} chat={chat} selected={selectedChat?.id === chat.id} onSelect={handleSelectChat} groupInitials={groupInitials} />)}
            </>
          )}
        </div>

        {/* Bottom status */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600">Online</span>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <button className="hover:text-gray-600 transition-colors"><Settings size={14} /></button>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6" /></svg>
          </div>
        </div>
      </div>

      {/* ── Middle: Messages ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChat && (
          <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                {selectedChat.chat_type === 'group'
                  ? <div className={`w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs`}>{groupInitials(selectedChat.name)}</div>
                  : <Avatar name={selectedChat.name} src={selectedChat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.name)}&background=random`} size={40} />
                }
                {selectedChat.chat_type === 'group' && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] text-gray-900">{selectedChat.name}</h3>
                  {selectedChat.chat_type === 'group' && <Star size={13} className="text-amber-400 fill-amber-400" />}
                </div>
                <p className="text-xs text-gray-400 font-medium">{(groupMembers.length || 0)} members • <span className="hover:text-blue-600 cursor-pointer">Add description</span></p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ActionBtn icon={<Phone size={15} />} />
              <ActionBtn icon={<Video size={15} />} />
              <ActionBtn icon={<MoreHorizontal size={15} />} onClick={() => setShowDetails(d => !d)} />
            </div>
          </div>
        )}

        <div className="bg-white border-b border-gray-100 p-2 flex items-center gap-4">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`p-2 text-sm border-b-2 transition-colors
                ${activeTab === tab ? 'text-red-600 border-red-500' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
              {tab}
            </button>
          ))}
          <button className="ml-auto text-gray-400 hover:text-gray-600 p-2"><Plus size={14} /></button>
          <button className="text-gray-400 hover:text-gray-600 p-2"><Search size={14} /></button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 bg-[#f8fafc]">
          {activeTab === 'Messages' && (
            <>
              {messages.map((msg, i) => renderMessage(msg, i))}
              <div ref={messagesEndRef} />
            </>
          )}
          {activeTab !== 'Messages' && (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <Hash size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-xs">No {activeTab.toLowerCase()} yet</p>
                <p className="text-xs mt-1">Share {activeTab.toLowerCase()} in this channel</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border-t border-gray-100 p-4">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded p-2.5 focus-within:border-blue-300 focus-within:bg-white transition-all">
            <input
              id="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-xs text-gray-700 outline-none placeholder-gray-400"
            />
          </div>
          <div className="flex items-center justify-between mt-2 px-1">
            <div className="flex items-center gap-1 text-gray-400">
                            <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
              <input type="file" className="hidden" accept="image/*" ref={imageInputRef} onChange={handleFileSelect} />
              <button onClick={() => handleIconClick('paperclip')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 hover:text-gray-600 transition-colors"><Paperclip size={15} /></button>
              <div className="relative">
                <button onClick={() => handleIconClick('smile')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 hover:text-gray-600 transition-colors"><Smile size={15} /></button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white border shadow-lg rounded-lg p-2 flex flex-wrap w-[220px] gap-2 z-50">
                    {EMOJIS.map(emoji => (
                      <button key={emoji} onClick={() => { setInput(prev => prev + emoji); setShowEmojiPicker(false); document.getElementById('chat-input')?.focus(); }} className="text-xl hover:bg-gray-100 rounded p-1">{emoji}</button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => handleIconClick('atsign')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 hover:text-gray-600 transition-colors"><AtSign size={15} /></button>
              <button onClick={() => handleIconClick('hash')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 hover:text-gray-600 transition-colors"><Hash size={15} /></button>
              <button onClick={() => handleIconClick('image')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 hover:text-gray-600 transition-colors"><Image size={15} /></button>
              <button onClick={() => handleIconClick('calendar')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 hover:text-gray-600 transition-colors"><Calendar size={15} /></button>
              <button onClick={() => handleIconClick('mic')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 hover:text-gray-600 transition-colors"><Mic size={15} /></button>
              <button onClick={() => handleIconClick('plus')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 hover:text-gray-600 transition-colors"><Plus size={15} /></button>
            </div>
            <button onClick={handleSend}
              className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors shadow-sm
                ${(input.trim() || attachedFile) ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Details ─────────────────────────────────────────── */}
      {showDetails && selectedChat && (
        <div className="w-[280px] shrink-0 bg-white border-l border-gray-100 flex flex-col overflow-hidden">
          <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-[14px] text-gray-900">Details</h3>
            <button onClick={() => setShowDetails(false)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"><X size={14} /></button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col items-center py-6 border-b border-gray-100">
              {selectedChat.chat_type === 'group' ? (
                <div className={`w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl mb-3 shadow-md`}>
                  {groupInitials(selectedChat.name)}
                </div>
              ) : (
                <Avatar name={selectedChat.name} src={selectedChat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.name)}&background=random`} size={64} />
              )}
              <h4 className="text-[14px] text-gray-900">{selectedChat.name}</h4>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{(groupMembers.length || 0)} Members</p>

              <div className="flex gap-4 mt-5">
                {[
                  { icon: <Phone size={16} />, label: 'Audio Call' },
                  { icon: <Video size={16} />, label: 'Video Call' },
                  { icon: <Users size={16} />, label: 'Add Members' },
                  { icon: <Search size={16} />, label: 'Search' },
                  { icon: <MoreHorizontal size={16} />, label: 'More' },
                ].map(({ icon, label }) => (
                  <button key={label} onClick={label === 'Add Members' ? () => setIsAddMemberOpen(true) : undefined} className="flex flex-col items-center gap-1.5">
                    <div className="w-9 h-9 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-full flex items-center justify-center text-gray-500 transition-colors">{icon}</div>
                    <span className="text-[9px] text-gray-400">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 py-4 border-b border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <h5 className="text-xs  text-gray-700 uppercase tracking-wider">About</h5>
                <button className="text-xs text-blue-600 hover:text-blue-700">Edit</button>
              </div>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">{selectedChat.description || 'No description available'}</p>
              <div className="mt-3 space-y-1 text-xs text-gray-500 font-medium">
                <p><span className="text-gray-700">Created by</span></p>
                <div className="flex items-center gap-2 mt-1">
                  <Avatar name={selectedChat.createdBy || 'Admin'} src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.createdBy || 'Admin')}&background=random`} size={22} />
                  <div>
                    <p className="text-xs text-gray-800">{selectedChat.createdBy || 'Admin'}</p>
                    <p className="text-[9px] text-gray-400">Created on {selectedChat.timestamp || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </div>

            {[
              { label: 'Media, Files & Links', count: (selectedChat.stats?.media || 0), icon: <Paperclip size={13} /> },
              { label: 'Pinned Messages', count: (selectedChat.stats?.pinned || 0), icon: <Pin size={13} /> },
              { label: 'Tasks', count: (selectedChat.stats?.tasks || 0), icon: <Check size={13} /> },
              { label: 'Events', count: (selectedChat.stats?.events || 0), icon: <Calendar size={13} /> },
              { label: 'Polls', count: (selectedChat.stats?.polls || 0), icon: <Hash size={13} /> },
            ].map(({ label, count, icon }) => (
              <button key={label} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors">
                <div className="flex items-center gap-2.5 text-[12px] text-gray-700">
                  <span className="text-gray-400">{icon}</span>{label}
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <span className="text-xs text-gray-500">{count}</span>
                  <ChevronRight size={12} />
                </div>
              </button>
            ))}

            {selectedChat.chat_type === 'group' && (
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs  text-gray-700 uppercase tracking-wider">Members ({groupMembers.length})</h5>
                  <button onClick={() => setIsAddMemberOpen(true)} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={10} /> Add Members</button>
                </div>
                <div className="space-y-2.5">
                  {groupMembers.slice(0, 5).map(m => {
                    const name = `${m.first_name} ${m.last_name}`;
                    return (
                      <div key={m.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <Avatar name={name} src={m.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} size={28} color="bg-blue-500" />
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-800 leading-tight">{name}</p>
                            <p className="text-[9px] text-gray-400 font-medium">{m.role || 'Member'}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {groupMembers.length > 5 && (
                  <button className="mt-3 text-xs text-blue-600 hover:text-blue-700">View all members</button>
                )}
              </div>
            )}

            <div className="px-4 py-3 border-b border-gray-100">
              <button className="w-full flex items-center justify-between text-[12px] text-gray-700 hover:text-gray-900 py-1">
                <div className="flex items-center gap-2"><Bell size={13} className="text-gray-400" /> Notifications</div>
                <span className="text-xs text-gray-400">All Messages <ChevronRight size={11} className="inline" /></span>
              </button>
              <button className="w-full flex items-center justify-between text-[12px] text-gray-700 hover:text-gray-900 py-1 mt-1">
                <div className="flex items-center gap-2"><FileText size={13} className="text-gray-400" /> Shared Files</div>
                <span className="text-xs text-gray-400">Visible to All <ChevronRight size={11} className="inline" /></span>
              </button>
            </div>

            <div className="px-4 py-4">
              <button className="flex items-center gap-2 text-[12px] text-red-500 hover:text-red-600 transition-colors">
                <LogOut size={13} /> Leave Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Team Modal */}
      {isCreateTeamOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-[400px]">
            <h3 className="text-lg font-bold mb-4">Create New Team</h3>
            <input
              type="text" placeholder="Team Name" value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
              className="w-full border rounded p-2 text-sm mb-3 focus:outline-blue-500"
            />
            <textarea
              placeholder="Description" value={newTeamDesc} onChange={e => setNewTeamDesc(e.target.value)}
              className="w-full border rounded p-2 text-sm mb-4 focus:outline-blue-500 h-20"
            />
            <h4 className="text-sm font-semibold mb-2">Select Members</h4>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" placeholder="Search employees..." 
                value={teamMemberSearch} onChange={e => setTeamMemberSearch(e.target.value)}
                className="w-full border rounded p-2 pl-8 text-sm focus:outline-blue-500"
              />
            </div>
            <div className="max-h-40 overflow-y-auto mb-4 border rounded p-2">
              {availableUsers.filter(u => teamMemberSearch.toLowerCase().trim() === 'employee' || (u.name || '').toLowerCase().includes(teamMemberSearch.toLowerCase())).map(u => (
                <label key={u.id} className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleUserSelection(u.id)} />
                  <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} className="w-6 h-6 rounded-full" />
                  <span className="text-sm">{u.name}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setIsCreateTeamOpen(false); setSelectedUserIds([]); setTeamMemberSearch(""); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleCreateTeam} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Create Team</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-5 w-[400px]">
            <h3 className="text-lg font-bold mb-4">Add Members to Team</h3>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" placeholder="Search employees..." 
                value={teamMemberSearch} onChange={e => setTeamMemberSearch(e.target.value)}
                className="w-full border rounded p-2 pl-8 text-sm focus:outline-blue-500"
              />
            </div>
            <div className="max-h-60 overflow-y-auto mb-4 border rounded p-2">
              {availableUsers.filter(u => teamMemberSearch.toLowerCase().trim() === 'employee' || (u.name || '').toLowerCase().includes(teamMemberSearch.toLowerCase())).map(u => {
                if (groupMembers.some(m => m.id === u.id)) return null;
                return (
                  <label key={u.id} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleUserSelection(u.id)} />
                    <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=random`} className="w-6 h-6 rounded-full" />
                    <span className="text-sm">{u.name}</span>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setIsAddMemberOpen(false); setSelectedUserIds([]); setTeamMemberSearch(""); }} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleAddMembers} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Add Members</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function ActionBtn({ icon, onClick }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
      {icon}
    </button>
  );
}

function ChatItem({ chat, selected, onSelect, groupInitials }) {
  return (
    <button
      onClick={() => onSelect(chat)}
      className={`w-full flex items-center gap-3 px-2 py-2.5 rounded transition-all mb-0.5 text-left
        ${selected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
    >
      <div className="relative shrink-0">
        {chat.chat_type === 'group'
          ? <div className={`w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-[12px]`}>{groupInitials(chat.name)}</div>
          : <img src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random`} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <h4 className="text-xs font-semibold text-gray-900 truncate pr-2">{chat.name}</h4>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{chat.timestamp?.split(' ')[1] || ''}</span>
        </div>
        <p className={`text-xs truncate ${chat.unread ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
          {chat.lastMessage || 'New Conversation'}
        </p>
      </div>
      {chat.unread > 0 && (
        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[9px] text-white font-bold shrink-0">
          {chat.unread}
        </div>
      )}
    </button>
  );
}

function Avatar({ name, src, size = 32, color = 'bg-gray-200' }) {
  if (src) {
    return <img src={src} alt={name} style={{ width: size, height: size }} className="rounded-full object-cover shrink-0" />;
  }
  const initials = name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';
  return (
    <div style={{ width: size, height: size }} className={`${color} rounded-full flex items-center justify-center text-white font-medium shrink-0 text-xs`}>
      {initials}
    </div>
  );
}
