import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Send, Phone, Video, MoreHorizontal, X, Plus, Filter,
  Star, Paperclip, Smile, AtSign, Hash, Calendar, FileText,
  ThumbsUp, Download, ChevronRight, Bell, Users, Settings,
  Mic, Image, Link, Check, CheckCheck, Pin, Edit3, LogOut, Trash2, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Swal from 'sweetalert2';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const formatMessageTime = (timeStr) => {
  if (!timeStr) {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }

  const str = String(timeStr).trim();

  // If already formatted like '10:10 AM' or '09:28 AM'
  if (/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(str)) {
    return str;
  }

  // If formatted like '2026-08-01 10:10:00' or ISO date
  try {
    const dateObj = new Date(str.includes('T') ? str : str.replace(/-/g, '/'));
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    }
  } catch (e) {}

  // Extract HH:MM AM/PM if present inside text
  const match = str.match(/(\d{1,2}:\d{2}\s*(?:AM|PM)?)/i);
  if (match) {
    return match[1];
  }

  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
};

const WhatsAppTicks = ({ status = 'read', isMine = true }) => {
  if (!isMine) return null;

  if (status === 'sent' || status === 'sending') {
    return <Check size={13} className="text-gray-400 shrink-0 inline-block ml-1" />;
  }

  if (status === 'delivered') {
    return <CheckCheck size={14} className="text-gray-400 shrink-0 inline-block ml-1" />;
  }

  // Double Blue Tick ✓✓ (#34b7f1)
  return <CheckCheck size={14} className="text-[#34b7f1] shrink-0 inline-block ml-1 font-bold" />;
};

export default function ITChatPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentUserId = user?.id || 1;
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
  const [tasksState, setTasksState] = useState({});
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSearchTerm, setMentionSearchTerm] = useState('');

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);

    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1 && lastAtIndex >= textBeforeCursor.search(/\s[^\s]*$/)) {
      const query = textBeforeCursor.slice(lastAtIndex + 1);
      setMentionSearchTerm(query);
      setShowMentionSuggestions(true);
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const handleSelectMentionUser = (userName) => {
    const cursorPosition = document.getElementById('chat-input')?.selectionStart || input.length;
    const textBeforeCursor = input.slice(0, cursorPosition);
    const textAfterCursor = input.slice(cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const newText = textBeforeCursor.slice(0, lastAtIndex) + `@${userName} ` + textAfterCursor;
      setInput(newText);
    } else {
      setInput(prev => prev + `@${userName} `);
    }

    setShowMentionSuggestions(false);
    document.getElementById('chat-input')?.focus();
  };

  const filteredMentionUsers = availableUsers.filter(u => {
    const name = u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim();
    return name.toLowerCase().includes(mentionSearchTerm.toLowerCase());
  });

  const getChatTasks = () => {
    if (!selectedChat) return [];
    return tasksState[selectedChat.id] || [
      { id: 1, title: 'Review project requirements document', completed: true, assignee: 'Purvesh' },
      { id: 2, title: 'Setup GitHub repository & branch rules', completed: false, assignee: 'Ashwini' },
      { id: 3, title: 'Verify database migration scripts', completed: false, assignee: 'You' }
    ];
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim() || !selectedChat) return;
    const chatId = selectedChat.id;
    const currentTasks = getChatTasks();
    const newTask = {
      id: Date.now(),
      title: newTaskTitle.trim(),
      completed: false,
      assignee: 'You'
    };
    setTasksState(prev => ({
      ...prev,
      [chatId]: [...currentTasks, newTask]
    }));
    setNewTaskTitle('');
  };

  const handleToggleTask = (taskId) => {
    if (!selectedChat) return;
    const chatId = selectedChat.id;
    const currentTasks = getChatTasks();
    setTasksState(prev => ({
      ...prev,
      [chatId]: currentTasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t)
    }));
  };

  const handleDeleteTask = (taskId) => {
    if (!selectedChat) return;
    const chatId = selectedChat.id;
    const currentTasks = getChatTasks();
    setTasksState(prev => ({
      ...prev,
      [chatId]: currentTasks.filter(t => t.id !== taskId)
    }));
  };

  const FILTER_TABS = ['All', 'Unread', 'Direct', 'Groups'];
  const TABS = ['Messages', 'Files', 'Links', 'Tasks'];

  const FILE_ICONS = {
    'pdf': <FileText size={22} className="text-red-500" />,
    'zip': <FileText size={22} className="text-blue-500" />,
    'png': <Image size={22} className="text-green-500" />
  };

  const fetchConversations = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/conversations/${currentUserId}`);
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/available-users/${currentUserId}`);
      setAvailableUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
      fetchAvailableUsers();
    }
  }, [currentUserId]);

  const fetchMessages = async (chat) => {
    try {
      const isGroup = chat.chat_type === 'group';
      const endpoint = isGroup
        ? `${API_BASE_URL}/messages/${currentUserId}?groupId=${chat.id}`
        : `${API_BASE_URL}/messages/${currentUserId}?conversationWith=${chat.other_user_id}`;
      const res = await axios.get(endpoint);
      setMessages(res.data);

      if (isGroup) {
        const membersRes = await axios.get(`${API_BASE_URL}/chat-groups/${chat.id}/members`);
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
      const interval = setInterval(() => fetchMessages(selectedChat), 4000);
      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectChat = (chat) => {
    setConversations(prev => prev.map(c => c.id === chat.id ? { ...c, unread: 0, unread_count: 0 } : c));
    setSelectedChat({ ...chat, unread: 0, unread_count: 0 });
    setActiveTab('Messages');
  };

  const handleIconClick = (action) => {
    if (action === 'smile') setShowEmojiPicker(!showEmojiPicker);
    if (action === 'paperclip') fileInputRef.current?.click();
    if (action === 'image') imageInputRef.current?.click();
    if (action === 'atsign') {
      setInput(prev => prev + '@');
      setShowMentionSuggestions(true);
      setMentionSearchTerm('');
      setTimeout(() => document.getElementById('chat-input')?.focus(), 50);
    }
    if (action === 'hash') { setInput(prev => prev + '#'); document.getElementById('chat-input')?.focus(); }
    if (action === 'calendar') { setInput(prev => prev + '📅 [Schedule a meeting] '); document.getElementById('chat-input')?.focus(); }
    if (action === 'mic') { setInput(prev => prev + '🎤 [Voice note] '); document.getElementById('chat-input')?.focus(); }
    if (action === 'plus') { setInput(prev => prev + '➕ '); document.getElementById('chat-input')?.focus(); }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) setAttachedFile(file);
    e.target.value = null;
  };

  const handleSend = async () => {
    if (!input.trim() && !attachedFile) return;
    if (!selectedChat) return;

    try {
      const isGroup = selectedChat.chat_type === 'group';
      const rawRecId = selectedChat.other_user_id || selectedChat.receiver_id || (!isGroup ? selectedChat.id : null);
      const targetReceiverId = rawRecId ? String(rawRecId).replace(/\D/g, '') : null;
      const targetGroupId = isGroup ? String(selectedChat.id).replace(/\D/g, '') : null;

      let res;
      if (attachedFile) {
        const formData = new FormData();
        formData.append('sender_id', currentUserId);
        if (targetGroupId) formData.append('group_id', targetGroupId);
        if (targetReceiverId) formData.append('receiver_id', targetReceiverId);
        formData.append('message_text', input.trim());
        formData.append('file', attachedFile);

        res = await axios.post(`${API_BASE_URL}/messages`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const payload = {
          sender_id: currentUserId,
          receiver_id: targetReceiverId ? parseInt(targetReceiverId, 10) : null,
          group_id: targetGroupId ? parseInt(targetGroupId, 10) : null,
          message_text: input.trim()
        };

        res = await axios.post(`${API_BASE_URL}/messages`, payload);
      }

      const newMsg = {
        id: res.data?.id || res.data?.messageId || Date.now(),
        sender: 'user',
        first_name: user?.first_name || 'You',
        last_name: user?.last_name || '',
        sender_avatar: user?.avatar,
        text: input.trim(),
        timestamp: formatMessageTime(),
        status: 'read',
        is_read: true,
        file: attachedFile ? {
          name: attachedFile.name,
          size: `${(attachedFile.size / 1024).toFixed(1)} KB`,
          icon: attachedFile.name.split('.').pop().toLowerCase()
        } : null
      };

      setMessages(prev => [...prev, newMsg]);
      setInput('');
      setAttachedFile(null);
      setShowEmojiPicker(false);
      setShowMentionSuggestions(false);
      fetchConversations();
    } catch (err) {
      console.error('Failed to send message', err);
      Swal.fire({ icon: 'error', title: 'Send Error', text: err?.response?.data?.error || 'Could not send message' });
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) return;
    try {
      const res = await axios.post(`${API_BASE_URL}/chat-groups`, {
        name: newTeamName,
        description: newTeamDesc,
        created_by: currentUserId,
        memberIds: selectedUserIds
      });
      setIsCreateTeamOpen(false);
      setNewTeamName('');
      setNewTeamDesc('');
      setSelectedUserIds([]);
      fetchConversations();
      Swal.fire({ icon: 'success', title: 'Team Created', text: `Team "${newTeamName}" created!` });
    } catch (err) {
      console.error('Failed to create team', err);
    }
  };

  const handleAddMembers = async () => {
    if (!selectedChat || selectedUserIds.length === 0) return;
    try {
      await axios.post(`${API_BASE_URL}/chat-groups/${selectedChat.id}/members`, {
        memberIds: selectedUserIds
      });
      setIsAddMemberOpen(false);
      setSelectedUserIds([]);
      fetchMessages(selectedChat);
      Swal.fire({ icon: 'success', title: 'Members Added', text: 'Members added to team!' });
    } catch (err) {
      console.error('Failed to add members', err);
    }
  };

  const isEmployeeSearch = searchTerm.trim().toLowerCase().startsWith('emp-') || searchTerm.trim().toLowerCase().startsWith('employee');

  const filteredChats = conversations.filter(chat => {
    const matchesSearch = (chat.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch && !isEmployeeSearch) return false;

    if (activeFilter === 'Unread') return Number(chat.unread_count || chat.unread || 0) > 0;
    if (activeFilter === 'Direct') return chat.chat_type === 'private';
    if (activeFilter === 'Groups') return chat.chat_type === 'group';
    return true;
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
    const senderName = isMine ? 'You' : `${msg.first_name || ''} ${msg.last_name || ''}`.trim();
    const avatarUrl = msg.sender_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=random`;

    const file = msg.file || (msg.file_name ? {
      name: msg.file_name,
      size: msg.file_size ? `${(msg.file_size / 1024).toFixed(1)} KB` : '0 KB',
      icon: (msg.file_type || 'pdf').toLowerCase(),
      path: msg.file_path
    } : null);

    const backendUrl = API_BASE_URL.replace('/api', '');
    const fileUrl = file ? (file.path ? `${backendUrl}${file.path}` : `${backendUrl}/uploads/${file.name}`) : '';

    return (
      <React.Fragment key={msg.id || idx}>
        {msg.date && (
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className={`text-xs px-3 py-1 rounded-full ${msg.date === 'New Messages' ? 'bg-red-50 text-red-500 font-semibold' : 'bg-gray-100 text-gray-500'}`}>{msg.date}</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
        )}
        <div className={`flex gap-2.5 px-5 py-1 group ${isMine ? 'flex-row-reverse' : ''}`}>
          {!isMine && <Avatar name={senderName} src={avatarUrl} size={32} />}
          <div className={`max-w-[70%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
            {!isMine && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[12px] font-semibold text-gray-900">{senderName}</span>
                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded">{'Member'}</span>
                <span className="text-[10px] text-gray-400 font-medium">{formatMessageTime(msg.timestamp || msg.created_at)}</span>
              </div>
            )}
            {msg.text && (
              <div className={`px-3.5 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap flex flex-col
                ${isMine ? 'bg-[#d9fdd3] text-gray-900 border border-[#bceab4] rounded-tr-xs self-end' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-xs self-start shadow-2xs'}`}>
                <div>{msg.text}</div>
                <div className="flex items-center gap-1 justify-end mt-1 text-[10px] text-gray-500 font-medium select-none">
                  <span>{formatMessageTime(msg.timestamp || msg.created_at)}</span>
                  <WhatsAppTicks status={msg.status || (msg.is_read ? 'read' : 'delivered')} isMine={isMine} />
                </div>
              </div>
            )}
            {file && (
              <div className="mt-1 flex items-center gap-2.5 p-2.5 rounded-xl border border-gray-200 bg-white shadow-2xs">
                {FILE_ICONS[file.icon] || <FileText size={22} className="text-gray-400" />}
                <div>
                  <p className="text-[12px] text-gray-800 font-medium">{file.name}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{file.size}</p>
                </div>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="ml-3 text-gray-400 hover:text-blue-600 transition-colors p-1"
                >
                  <Download size={15} />
                </a>
              </div>
            )}
          </div>
          <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 self-center ${isMine ? 'mr-2' : 'ml-2'}`}>
            <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 cursor-pointer"><Smile size={12} /></button>
            <button className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 cursor-pointer"><MoreHorizontal size={12} /></button>
          </div>
        </div>
      </React.Fragment>
    );
  };

  return (
    <div className="flex bg-[#f8fafc] font-sans text-gray-900 overflow-hidden w-full h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Left Panel: Chat List ─────────────────────────────────────────── */}
      <div className="w-[280px] shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-3.5 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/it/it manager/ashwinikhedekar1025/dashboard');
                }
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-700 hover:text-red-600 transition flex items-center gap-1 cursor-pointer font-semibold text-xs bg-gray-50 border border-gray-200 shadow-xs"
              title="Back to Dashboard"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <div className="w-px h-4 bg-gray-200 mx-0.5" />
            <h2 className="text-[14px] font-bold text-gray-900">Team Chat</h2>
          </div>
          <button onClick={() => setIsCreateTeamOpen(true)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors" title="Create New Team Chat"><Edit3 size={14} /></button>
        </div>

        {/* Filter Tabs */}
        <div className="px-3 pt-3 border-b border-gray-100">
          <div className="flex gap-3">
            {FILTER_TABS.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={`p-2 text-xs transition-colors cursor-pointer
                  ${activeFilter === f ? 'text-red-600 border-b-2 border-red-500 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="p-3">
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
                <span className="text-xs text-amber-500 tracking-wider flex items-center gap-1 font-semibold"><Pin size={10} /> Pinned</span>
                <button className="text-gray-400 hover:text-gray-600"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6" /></svg></button>
              </div>
              {pinned.map(chat => <ChatItem key={chat.id} chat={chat} selected={selectedChat?.id === chat.id} onSelect={handleSelectChat} groupInitials={groupInitials} />)}
            </>
          )}
          {recent.length > 0 && (
            <>
              <div className="flex items-center justify-between p-2 mb-1 mt-2">
                <span className="text-xs text-gray-400 tracking-wider font-semibold">Recent</span>
                <button className="text-gray-400 hover:text-gray-600"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6" /></svg></button>
              </div>
              {recent.map(chat => <ChatItem key={chat.id} chat={chat} selected={selectedChat?.id === chat.id} onSelect={handleSelectChat} groupInitials={groupInitials} />)}
            </>
          )}
          {directoryUsers.length > 0 && (
            <>
              <div className="flex items-center justify-between p-2 mb-1 mt-2 border-t border-gray-100 pt-2">
                <span className="text-xs text-blue-500 tracking-wider flex items-center gap-1 font-semibold"><Users size={10} /> Company Directory</span>
              </div>
              {directoryUsers.map(chat => <ChatItem key={chat.id} chat={chat} selected={selectedChat?.id === chat.id} onSelect={handleSelectChat} groupInitials={groupInitials} />)}
            </>
          )}
        </div>

        {/* Bottom status */}
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600 font-medium">Online</span>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" /></svg>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <button className="hover:text-gray-600 transition-colors cursor-pointer"><Settings size={14} /></button>
          </div>
        </div>
      </div>

      {/* ── Middle: Messages ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-gray-50/50">
        {selectedChat && (
          <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between shrink-0 z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                {selectedChat.chat_type === 'group'
                  ? <div className={`w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold`}>{groupInitials(selectedChat.name)}</div>
                  : <Avatar name={selectedChat.name} src={selectedChat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.name)}&background=random`} size={40} />
                }
                {selectedChat.chat_type === 'group' && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-bold text-gray-900">{selectedChat.name}</h3>
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

        <div className="sticky top-[64px] bg-white border-b border-gray-100 p-2 flex items-center gap-4 z-10">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`text-xs px-3 py-1.5 rounded transition-colors cursor-pointer ${activeTab === tab ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'Messages' && (
            messages.length > 0 ? (
              messages.map((msg, idx) => renderMessage(msg, idx))
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                No messages yet. Send a message to start conversation.
              </div>
            )
          )}

          {activeTab === 'Files' && (
            <div className="p-4 space-y-2">
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Shared Files</h4>
              {messages.filter(m => m.file || m.file_name).map((m, i) => (
                <div key={i} className="p-3 bg-white border border-gray-200 rounded-lg flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-blue-500" />
                    <span>{m.file_name || m.file?.name}</span>
                  </div>
                  <span className="text-gray-400">{formatMessageTime(m.timestamp || m.created_at)}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Tasks' && (
            <div className="p-4 space-y-3 font-sans">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-gray-800">Team Tasks & To-Dos</h4>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a new task..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                  className="flex-1 p-2 border border-gray-300 rounded text-xs outline-none bg-white focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddTask}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                >
                  Add Task
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {getChatTasks().map(task => (
                  <div key={task.id} className="p-2.5 bg-white border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                        className="rounded text-blue-600 cursor-pointer"
                      />
                      <span className={task.completed ? 'line-through text-gray-400' : 'text-gray-800 font-medium'}>{task.title}</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{task.assignee}</span>
                      <button onClick={() => handleDeleteTask(task.id)} className="text-gray-400 hover:text-red-500 cursor-pointer">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-gray-100 relative">
          {showMentionSuggestions && (
            <div className="absolute bottom-full left-4 bg-white border border-gray-200 rounded-lg shadow-xl max-h-40 overflow-y-auto z-50 w-64 p-1 text-xs">
              <div className="text-[10px] font-bold text-gray-400 px-2 py-1 uppercase">Mention Team Member</div>
              {filteredMentionUsers.map(u => {
                const uName = u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim();
                return (
                  <div
                    key={u.id}
                    onClick={() => handleSelectMentionUser(uName)}
                    className="p-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2 rounded text-gray-800 font-medium"
                  >
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                      {uName.substring(0, 2).toUpperCase()}
                    </div>
                    <span>{uName}</span>
                  </div>
                );
              })}
            </div>
          )}

          {showEmojiPicker && (
            <div className="absolute bottom-full left-4 bg-white border border-gray-200 rounded-lg shadow-xl p-2 z-50 flex gap-2 flex-wrap max-w-xs mb-2">
              {EMOJIS.map(emoji => (
                <button key={emoji} onClick={() => setInput(prev => prev + emoji)} className="text-lg hover:scale-125 transition-transform p-1">
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {attachedFile && (
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-xs text-blue-900">
              <span className="truncate flex items-center gap-1"><Paperclip size={13} /> {attachedFile.name}</span>
              <button onClick={() => setAttachedFile(null)} className="text-blue-700 hover:text-red-500 p-0.5"><X size={14} /></button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400 focus-within:bg-white transition-all">
            <input
              id="chat-input"
              type="text"
              placeholder="Type a message... (Use @ to mention)"
              value={input}
              onChange={handleInputChange}
              onKeyPress={e => e.key === 'Enter' && handleSend()}
              className="w-full text-xs outline-none bg-transparent text-gray-800 placeholder-gray-400"
            />
            <div className="flex items-center gap-1.5 text-gray-400">
              <button onClick={() => handleIconClick('smile')} className="hover:text-gray-600 cursor-pointer p-1"><Smile size={16} /></button>
              <button onClick={() => handleIconClick('paperclip')} className="hover:text-gray-600 cursor-pointer p-1"><Paperclip size={16} /></button>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
              <button onClick={handleSend} className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer shadow-xs ml-1">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Details ─────────────────────────────────────────── */}
      {showDetails && selectedChat && (
        <div className="w-[280px] shrink-0 bg-white border-l border-gray-100 p-4 overflow-y-auto space-y-4 text-xs font-sans">
          <div className="flex justify-between items-center border-b pb-3">
            <span className="font-bold text-gray-800 text-sm">Details</span>
            <button onClick={() => setShowDetails(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X size={16} /></button>
          </div>

          <div className="text-center space-y-2 py-2">
            <Avatar name={selectedChat.name} src={selectedChat.avatar} size={64} color="bg-blue-500" />
            <h3 className="font-bold text-gray-900 text-sm">{selectedChat.name}</h3>
            <p className="text-gray-400 text-[11px] font-medium">{(groupMembers.length || 0)} Members</p>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg space-y-1">
            <span className="text-gray-500 font-semibold text-[10px] uppercase tracking-wider block">About</span>
            <p className="text-gray-700 leading-relaxed text-xs">No description available</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon, onClick }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
      {icon}
    </button>
  );
}

function ChatItem({ chat, selected, onSelect, groupInitials }) {
  const rawTime = chat.timestamp || chat.created_at || '';
  const displayTime = formatMessageTime(rawTime);
  const unreadCount = Number(chat.unread_count || chat.unread || 0);

  return (
    <button
      onClick={() => onSelect(chat)}
      className={`w-full flex items-center gap-3 px-2 py-2.5 rounded transition-all mb-0.5 text-left cursor-pointer
        ${selected ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}
    >
      <div className="relative shrink-0">
        {chat.chat_type === 'group'
          ? <div className={`w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-[12px] font-bold`}>{groupInitials(chat.name)}</div>
          : <img src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random`} alt={chat.name} className="w-10 h-10 rounded-full object-cover" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <h4 className="text-xs font-semibold text-gray-900 truncate pr-2">{chat.name}</h4>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{displayTime}</span>
        </div>
        <p className={`text-xs truncate ${unreadCount > 0 ? 'font-bold text-gray-900' : 'text-gray-500'}`}>
          {chat.lastMessage || 'New Conversation'}
        </p>
      </div>
      {unreadCount > 0 && (
        <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[9px] font-bold text-white shrink-0 shadow-xs">
          {unreadCount > 99 ? '99+' : unreadCount}
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
