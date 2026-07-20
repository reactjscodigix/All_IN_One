const fs = require('fs');
let content = fs.readFileSync('client/src/components/ITChatPage.js', 'utf8');

// 1. Fix directoryUsers calculation
const newDirectoryLogic = `  const directoryUsers = searchTerm.trim() 
    ? availableUsers.filter(u => 
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) &&
        !recent.some(c => c.other_user_id === u.id) &&
        !pinned.some(c => c.other_user_id === u.id)
      ).map(u => ({
        id: \`dummy-\${u.id}\`,
        chat_type: 'private',
        other_user_id: u.id,
        name: u.name || '',
        avatar: u.avatar || '',
        status: u.status || 'Active',
        lastMessage: 'Start a new conversation'
      }))
    : [];`;

content = content.replace(
  /  const directoryUsers = searchTerm\.trim\(\)[\s\S]*?\: \[\];/,
  newDirectoryLogic
);

// 2. Add teamMemberSearch state
content = content.replace(
  /  const \[selectedUserIds, setSelectedUserIds\] = useState\(\[\]\);\n  const \[groupMembers, setGroupMembers\] = useState\(\[\]\);/,
  `  const [selectedUserIds, setSelectedUserIds] = useState([]);\n  const [groupMembers, setGroupMembers] = useState([]);\n  const [teamMemberSearch, setTeamMemberSearch] = useState('');`
);

// 3. Update Create Team Modal to include search bar
const createTeamSearch = `<h4 className="text-sm font-semibold mb-2">Select Members</h4>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" placeholder="Search employees..." 
                value={teamMemberSearch} onChange={e => setTeamMemberSearch(e.target.value)}
                className="w-full border rounded p-2 pl-8 text-sm focus:outline-blue-500"
              />
            </div>
            <div className="max-h-40 overflow-y-auto mb-4 border rounded p-2">
              {availableUsers.filter(u => (u.name || '').toLowerCase().includes(teamMemberSearch.toLowerCase())).map(u => (`;

content = content.replace(
  /<h4 className="text-sm font-semibold mb-2">Select Members<\/h4>\n(\s*)<div className="max-h-40 overflow-y-auto mb-4 border rounded p-2">\n(\s*)\{availableUsers\.map\(u => \(/,
  createTeamSearch
);

// 4. Update Add Member Modal to include search bar
const addMemberSearch = `<h3 className="text-lg  mb-4">Add Members to Team</h3>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" placeholder="Search employees..." 
                value={teamMemberSearch} onChange={e => setTeamMemberSearch(e.target.value)}
                className="w-full border rounded p-2 pl-8 text-sm focus:outline-blue-500"
              />
            </div>
            <div className="max-h-60 overflow-y-auto mb-4 border rounded p-2">
              {availableUsers.filter(u => (u.name || '').toLowerCase().includes(teamMemberSearch.toLowerCase())).map(u => {`;

content = content.replace(
  /<h3 className="text-lg  mb-4">Add Members to Team<\/h3>\n(\s*)<div className="max-h-60 overflow-y-auto mb-4 border rounded p-2">\n(\s*)\{availableUsers\.map\(u => \{/,
  addMemberSearch
);

// 5. Reset teamMemberSearch on modal close
content = content.replace(/setIsCreateTeamOpen\(false\); setSelectedUserIds\(\[\]\);/g, 'setIsCreateTeamOpen(false); setSelectedUserIds([]); setTeamMemberSearch("");');
content = content.replace(/setIsAddMemberOpen\(false\); setSelectedUserIds\(\[\]\);/g, 'setIsAddMemberOpen(false); setSelectedUserIds([]); setTeamMemberSearch("");');

fs.writeFileSync('client/src/components/ITChatPage.js', content, 'utf8');
console.log('Patched ITChatPage.js modals with search and fixed directory search');
