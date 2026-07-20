const fs = require('fs');
const path = 'client/src/components/ITChatPage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add axios
if (!content.includes('import axios')) {
  content = content.replace(/import React, \{ useState, useRef, useEffect \} from 'react';/, "import React, { useState, useRef, useEffect } from 'react';\nimport axios from 'axios';");
}

// 2. Remove mock data
content = content.replace(/\/\/ ─── Mock Data ──────────────────────────────────────────────────────────────[\s\S]*?(?=export default function ITChatPage)/, '');

// 3. Update component state and initialization
const newState = `
  const CURRENT_USER_ID = 1; // Assuming IT Manager is user ID 1
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('Messages');
  const [showDetails, setShowDetails] = useState(true);
  const messagesEndRef = useRef(null);

  // New states for Modals
  const [availableUsers, setAvailableUsers] = useState([]);
  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);

  const fetchConversations = async () => {
    try {
      const res = await axios.get(\`/api/conversations/\${CURRENT_USER_ID}\`);
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const res = await axios.get(\`/api/available-users/\${CURRENT_USER_ID}\`);
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
        ? \`/api/messages/\${CURRENT_USER_ID}?groupId=\${chat.id}\`
        : \`/api/messages/\${CURRENT_USER_ID}?conversationWith=\${chat.other_user_id}\`;
      const res = await axios.get(endpoint);
      setMessages(res.data);
      
      if (isGroup) {
        const membersRes = await axios.get(\`/api/chat-groups/\${chat.id}/members\`);
        setGroupMembers(membersRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat);
      const interval = setInterval(() => fetchMessages(selectedChat), 5000); // simple polling
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

  const handleSend = async () => {
    if (!input.trim() || !selectedChat) return;
    try {
      const isGroup = selectedChat.chat_type === 'group';
      const payload = {
        sender_id: CURRENT_USER_ID,
        message_text: input,
      };
      if (isGroup) {
        payload.group_id = selectedChat.id;
      } else {
        payload.receiver_id = selectedChat.other_user_id;
      }

      await axios.post('/api/messages', payload);
      setInput('');
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
      await axios.post(\`/api/chat-groups/\${selectedChat.id}/members\`, {
        members: selectedUserIds
      });
      setIsAddMemberOpen(false);
      setSelectedUserIds([]);
      fetchMessages(selectedChat); // Refreshes members too
    } catch (err) {
      console.error('Failed to add members', err);
    }
  };

  const toggleUserSelection = (id) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(u => u !== id) : [...prev, id]);
  };
`;

content = content.replace(
  /  const \[selectedChat, setSelectedChat\] = useState\(CHATS\[0\]\);[\s\S]*?const handleSend = \(\) => \{[\s\S]*?MESSAGES_BY_CHAT\[selectedChat\.id\] = \[\.\.\.\(MESSAGES_BY_CHAT\[selectedChat\.id\] \|\| \[\]\), newMsg\];\n  \};/,
  newState
);

// Fix filtering to use 'conversations' instead of CHATS
content = content.replace(/const filteredChats = CHATS\.filter/g, 'const filteredChats = conversations.filter');
// Fix c.type -> c.chat_type, c.unread -> 0 (for now), c.lastMsg -> c.lastMessage
content = content.replace(/c\.type === 'direct'/g, "c.chat_type === 'direct'");
content = content.replace(/c\.type === 'group'/g, "c.chat_type === 'group'");
content = content.replace(/c\.unread > 0/g, "false /* No unread yet */");
content = content.replace(/c\.lastMsg\.toLowerCase\(\)/g, "(c.lastMessage || '').toLowerCase()");

// Replace renderMessage fields mapping
content = content.replace(
  /const renderMessage = \(msg, idx\) => \{[\s\S]*?const isMine = msg\.isMine;/g,
  `const renderMessage = (msg, idx) => {
    const isMine = msg.sender === 'user';
    const senderName = isMine ? 'You' : \`\${msg.first_name} \${msg.last_name}\`;
    const avatarUrl = msg.sender_avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(senderName)}&background=random\`;`
);
content = content.replace(/msg\.sender/g, 'senderName');
content = content.replace(/AVATARS\[senderName\]/g, 'avatarUrl');
content = content.replace(/msg\.role/g, "'Member'"); // Fallback

// Replace chat rendering fields
content = content.replace(/chat\.type === 'group'/g, "chat.chat_type === 'group'");
// Replace AVATARS references globally for chat list
content = content.replace(/src=\{chat\.avatar\}/g, "src={chat.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=random`}");
content = content.replace(/src=\{AVATARS\[selectedChat\.createdBy\]\}/g, "src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.createdBy || 'Admin')}&background=random`}");
content = content.replace(/AVATARS\[name\]/g, "`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`");
content = content.replace(/ROLES\[name\]/g, "(m.role || 'Member')");

// Fix members mapping in right panel
content = content.replace(
  /\{selectedChat\.memberList\.slice\(0, 5\)\.map\(name => \([\s\S]*?name={name}[\s\S]*?\{name\}<\/p>[\s\S]*?ROLES\[name\][\s\S]*?\}\)\}/g,
  `{groupMembers.slice(0, 5).map(m => {
    const name = \`\${m.first_name} \${m.last_name}\`;
    return (
      <div key={m.id} className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Avatar name={name} src={m.avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(name)}&background=random\`} size={28} color="bg-blue-500" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
          </div>
          <div>
            <p className="text-xs  text-gray-800 leading-tight">{name}</p>
            <p className="text-[9px] text-gray-400 font-medium">{m.role || 'Member'}</p>
          </div>
        </div>
      </div>
    );
  })}`
);
content = content.replace(/selectedChat\.members/g, "(groupMembers.length || 0)");
content = content.replace(/selectedChat\.memberList\.length/g, "groupMembers.length");

// Fix Add Member button
content = content.replace(
  /<button className="text-xs  text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size=\{10\} \/> Add Members<\/button>/g,
  `<button onClick={() => setIsAddMemberOpen(true)} className="text-xs  text-blue-600 hover:text-blue-700 flex items-center gap-1"><Plus size={10} /> Add Members</button>`
);

// Fix Create Team button (Edit3)
content = content.replace(
  /<button onClick=\{[^}]*\} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"><Edit3 size=\{14\} \/><\/button>/g,
  `<button onClick={() => setIsCreateTeamOpen(true)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"><Edit3 size={14} /></button>`
);

// Add Modals to the end of the file before the last closing div of ITChatPage
const modalsCode = `
      {/* Create Team Modal */}
      {isCreateTeamOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-2 w-[400px]">
            <h3 className="text-lg  mb-4">Create New Team</h3>
            <input 
              type="text" placeholder="Team Name" value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
              className="w-full border rounded p-2 text-sm mb-3 focus:outline-blue-500"
            />
            <textarea 
              placeholder="Description" value={newTeamDesc} onChange={e => setNewTeamDesc(e.target.value)}
              className="w-full border rounded p-2 text-sm mb-4 focus:outline-blue-500 h-20"
            />
            <h4 className="text-sm font-semibold mb-2">Select Members</h4>
            <div className="max-h-40 overflow-y-auto mb-4 border rounded p-2">
              {availableUsers.map(u => (
                <label key={u.id} className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleUserSelection(u.id)} />
                  <img src={u.avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(u.name)}&background=random\`} className="w-6 h-6 rounded-full" />
                  <span className="text-sm">{u.name}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => {setIsCreateTeamOpen(false); setSelectedUserIds([]);}} className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleCreateTeam} className="p-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Create Team</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-2 w-[400px]">
            <h3 className="text-lg  mb-4">Add Members to Team</h3>
            <div className="max-h-60 overflow-y-auto mb-4 border rounded p-2">
              {availableUsers.map(u => {
                // Hide users already in the team
                if (groupMembers.some(m => m.id === u.id)) return null;
                return (
                  <label key={u.id} className="flex items-center gap-2 mb-2 cursor-pointer">
                    <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => toggleUserSelection(u.id)} />
                    <img src={u.avatar || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(u.name)}&background=random\`} className="w-6 h-6 rounded-full" />
                    <span className="text-sm">{u.name}</span>
                  </label>
                );
              })}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => {setIsAddMemberOpen(false); setSelectedUserIds([]);}} className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleAddMembers} className="p-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Add Members</button>
            </div>
          </div>
        </div>
      )}
`;

content = content.replace(/(    <\/div>\n  \);\n\}\n\nfunction ActionBtn)/, `${modalsCode}\n$1`);

// Safe guards for selectedChat properties that might be missing
content = content.replace(/selectedChat\.stats\.media/g, "(selectedChat.stats?.media || 0)");
content = content.replace(/selectedChat\.stats\.pinned/g, "(selectedChat.stats?.pinned || 0)");
content = content.replace(/selectedChat\.stats\.tasks/g, "(selectedChat.stats?.tasks || 0)");
content = content.replace(/selectedChat\.stats\.events/g, "(selectedChat.stats?.events || 0)");
content = content.replace(/selectedChat\.stats\.polls/g, "(selectedChat.stats?.polls || 0)");
content = content.replace(/selectedChat\.createdBy/g, "(selectedChat.createdBy || 'Admin')");
content = content.replace(/selectedChat\.createdOn/g, "(selectedChat.timestamp || 'Unknown')");

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched ITChatPage.js');
