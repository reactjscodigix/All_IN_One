const fs = require('fs');

let content = fs.readFileSync('client/src/components/ITChatPage.js', 'utf8');

// 1. Add states and refs
const stateRepl = `  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const EMOJIS = ['😀', '😂', '😍', '👍', '🙏', '🔥', '🎉', '❤️', '🤔', '🙌', '😢', '👏', '👀', '💯', '✨'];`;

content = content.replace(
  /const \[conversations, setConversations\] = useState\(\[\]\);/,
  stateRepl + '\n  const [conversations, setConversations] = useState([]);'
);

// 2. Add handleIconClick and handleFileSelect
const handlers = `
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
`;
content = content.replace(/const handleSend = async \(\) => \{/, handlers + '\n  const handleSend = async () => {');

// 3. Update handleSend
const handleSendRepl = `const handleSend = async () => {
    let textToSend = input.trim();
    if (attachedFile) {
      textToSend += (textToSend ? '\\n' : '') + \`[Attached File: \${attachedFile.name}]\`;
    }
    if (!textToSend && !attachedFile) return;
    if (!selectedChat) return;
    try {
      const isGroup = selectedChat.chat_type === 'group';
      const payload = {
        sender_id: CURRENT_USER_ID,
        message_text: textToSend,
      };`;

content = content.replace(/const handleSend = async \(\) => \{\n\s*if \(\!input\.trim\(\) \|\| \!selectedChat\) return;\n\s*try \{\n\s*const isGroup = selectedChat\.chat_type === 'group';\n\s*const payload = \{\n\s*sender_id: CURRENT_USER_ID,\n\s*message_text: input,\n\s*\};/, handleSendRepl);

// Also reset attachedFile and emoji picker
content = content.replace(/setInput\(''\);/, "setInput(''); setAttachedFile(null); setShowEmojiPicker(false);");

// 4. Update the render logic for the input area
// Add id="chat-input"
content = content.replace(/value=\{input\}/, `id="chat-input"\n              value={input}`);

// 5. Replace the hardcoded icons block
const iconsBlock = `              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
              <input type="file" className="hidden" accept="image/*" ref={imageInputRef} onChange={handleFileSelect} />
              <button onClick={() => handleIconClick('paperclip')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 hover:text-gray-600 transition-colors"><Paperclip size={15} /></button>
              <div className="relative">
                <button onClick={() => handleIconClick('smile')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 hover:text-gray-600 transition-colors"><Smile size={15} /></button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 bg-white border shadow-lg rounded p-2 flex flex-wrap w-[220px] gap-2 z-50">
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
              <button onClick={() => handleIconClick('plus')} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 hover:text-gray-600 transition-colors"><Plus size={15} /></button>`;

content = content.replace(
  /\{\[<Paperclip key="1" size=\{15\} \/>, <Smile key="2" size=\{15\} \/>, <AtSign key="3" size=\{15\} \/>, <Hash key="4" size=\{15\} \/>, <Image key="5" size=\{15\} \/>, <Calendar key="6" size=\{15\} \/>, <Mic key="7" size=\{15\} \/>, <Plus key="8" size=\{15\} \/>\]\.map\(\(icon, i\) => \(\n\s*<button key=\{i\} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 hover:text-gray-600 transition-colors">\{icon\}<\/button>\n\s*\)\)\}/,
  iconsBlock
);

// 6. Show attached file above the input field
const attachedFileUI = `          {attachedFile && (
            <div className="mx-4 mt-2 p-2 bg-blue-50 border border-blue-100 rounded flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-blue-500" />
                <span className="text-sm text-blue-700">{attachedFile.name}</span>
              </div>
              <button onClick={() => setAttachedFile(null)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
            </div>
          )}
          <div className="flex items-center gap-2 p-2 mx-4 mt-2 bg-gray-50 rounded border focus-within:border-blue-400 focus-within:bg-white transition-colors">`;

content = content.replace(
  /<div className="flex items-center gap-2 p-2 mx-4 mt-2 bg-gray-50 rounded border focus-within:border-blue-400 focus-within:bg-white transition-colors">/,
  attachedFileUI
);

// 7. Fix Send button active state (now should also activate if attachedFile exists)
content = content.replace(
  /\$\{input\.trim\(\) \? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'\}/,
  "${(input.trim() || attachedFile) ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}"
);

fs.writeFileSync('client/src/components/ITChatPage.js', content, 'utf8');
console.log('Patched ITChatPage icons successfully.');
