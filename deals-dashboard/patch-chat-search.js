const fs = require('fs');
let content = fs.readFileSync('client/src/components/ITChatPage.js', 'utf8');

// 1. Insert directoryUsers calculation
const directoryLogic = `  const pinned = filteredChats.filter(c => c.pinned);
  const recent = filteredChats.filter(c => !c.pinned);

  const directoryUsers = searchTerm.trim() 
    ? availableUsers.filter(u => 
        \`\${u.first_name || ''} \${u.last_name || ''}\`.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !recent.some(c => c.other_user_id === u.id) &&
        !pinned.some(c => c.other_user_id === u.id)
      ).map(u => ({
        id: \`dummy-\${u.id}\`,
        chat_type: 'private',
        other_user_id: u.id,
        name: \`\${u.first_name || ''} \${u.last_name || ''}\`,
        avatar: u.avatar || '',
        status: 'Online',
        lastMessage: 'Start a new conversation'
      }))
    : [];`;

content = content.replace(
  /  const pinned = filteredChats.filter\(c => c.pinned\);\n  const recent = filteredChats.filter\(c => !c.pinned\);/,
  directoryLogic
);

// 2. Insert rendering of directoryUsers
const renderLogic = `          {directoryUsers.length > 0 && (
            <>
              <div className="flex items-center justify-between px-2 py-1.5 mb-1 mt-2 border-t border-gray-100 pt-2">
                <span className="text-xs font-extrabold text-blue-500 uppercase tracking-wider flex items-center gap-1"><Users size={10} /> Company Directory</span>
              </div>
              {directoryUsers.map(chat => <ChatItem key={chat.id} chat={chat} selected={selectedChat?.id === chat.id} onSelect={handleSelectChat} groupInitials={groupInitials} />)}
            </>
          )}`;

content = content.replace(
  /(\s*)\{\/\* Bottom status \*\/\}/,
  `\n${renderLogic}\n        </div>\n        {/* Bottom status */}`
);

// We need to make sure we remove the closing </div> of "Chat List" that might be before "{/* Bottom status */}" 
// Wait, the original code is:
//           {recent.length > 0 && ( ... )}
//         </div>
//         {/* Bottom status */}
// So my replacement `\n${renderLogic}\n        </div>\n        {/* Bottom status */}` means I should replace:
// `        </div>\n\n        {/* Bottom status */}`
content = content.replace(
  /(\s*)<\/div>\n(\s*)\{\/\* Bottom status \*\/\}/,
  `\n${renderLogic}\n        </div>\n\n        {/* Bottom status */}`
);

fs.writeFileSync('client/src/components/ITChatPage.js', content, 'utf8');
console.log('Patched ITChatPage.js');
