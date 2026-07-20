const fs = require('fs');

// 1. Refactor CreateNoteModal.js
const modalPath = 'client/src/components/CreateNoteModal.js';
let modalContent = fs.readFileSync(modalPath, 'utf8');

// Replace standard page setup with Modal props and wrapper
modalContent = modalContent.replace(
  /const CreateNotePage = \(\) => \{/g,
  `const CreateNoteModal = ({ isOpen, onClose, onSave }) => {`
);

// We need to return null if !isOpen
modalContent = modalContent.replace(
  /const handlePublish = async \(\) => \{/g,
  `if (!isOpen) return null;
  const handlePublish = async () => {`
);

// We shouldn't use navigate(-1)
modalContent = modalContent.replace(/navigate\(-1\)/g, 'onClose()');
// And on successful save
modalContent = modalContent.replace(
  /navigate\(\`\/\$\{dept\}\/manager\/\$\{username\}\/notes\`\);/g,
  `if (onSave) onSave();\n      onClose();`
);

// Wrap the main return in a modal overlay
modalContent = modalContent.replace(
  /<div className="min-h-screen bg-gray-50 flex flex-col font-sans">/g,
  `<div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 sm:p-6 lg:p-8">
      <div className="bg-gray-50 flex flex-col font-sans rounded-xl overflow-hidden w-full max-w-7xl max-h-[95vh] shadow-2xl relative">`
);

// Export CreateNoteModal
modalContent = modalContent.replace(/export default CreateNotePage;/g, 'export default CreateNoteModal;');

fs.writeFileSync(modalPath, modalContent, 'utf8');

// 2. Update ITNotesPage.js
const notesPath = 'client/src/components/ITNotesPage.js';
let notesContent = fs.readFileSync(notesPath, 'utf8');

// Import CreateNoteModal
if (!notesContent.includes('import CreateNoteModal')) {
  notesContent = notesContent.replace(
    /import React, \{ useState, useMemo, useEffect \} from 'react';/,
    `import React, { useState, useMemo, useEffect } from 'react';\nimport CreateNoteModal from './CreateNoteModal';`
  );
}

// Add state for modal
if (!notesContent.includes('isCreateModalOpen')) {
  notesContent = notesContent.replace(
    /const \[allNotes, setAllNotes\] = useState\(\[\]\);/,
    `const [allNotes, setAllNotes] = useState([]);\n  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);`
  );
}

// Update left nav button
notesContent = notesContent.replace(
  /onClick=\{\(\) => navigate\(\`\/\$\{isIT \? 'it' : 'seo-gmb'\}\/\$\{designation \|\| 'manager'\}\/\$\{username \|\| 'ashwini'\}\/notes\/create\`\)\}/g,
  `onClick={() => setIsCreateModalOpen(true)}`
);

// Render the modal at the bottom
if (!notesContent.includes('<CreateNoteModal')) {
  notesContent = notesContent.replace(
    /<\/div>\n    <\/div>\n  \);\n\}/g,
    `  <CreateNoteModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSave={() => {
          // Re-fetch notes
          axios.get('http://localhost:5000/api/notes').then(res => {
            const formatted = res.data.map(n => {
              let extra = {};
              try { if (n.description && n.description.startsWith('{')) extra = JSON.parse(n.description); } catch(e) {}
              return {
                id: n.id, title: n.title, starred: n.is_important === 1, subtitle: extra.summary || 'Note Document',
                type: extra.type || 'Note', category: extra.category || 'General', updatedBy: n.created_by || 'Admin',
                updatedAt: new Date(n.created_at).toLocaleDateString(), time: new Date(n.created_at).toLocaleTimeString(),
                createdBy: n.created_by || 'Admin', createdAt: new Date(n.created_at).toLocaleString(),
                lastUpdated: new Date(n.created_at).toLocaleString(), tags: extra.tags ? extra.tags.split(',').map(t => t.trim()) : [],
                description: extra.content || n.description || '', attachments: [], recentInCategory: []
              };
            });
            setAllNotes(formatted);
          });
        }}
      />
      </div>
    </div>
  );
}`
  );
}

fs.writeFileSync(notesPath, notesContent, 'utf8');

// 3. Remove CreateNotePage route from App.js
const appJsPath = 'client/src/App.js';
let appContent = fs.readFileSync(appJsPath, 'utf8');
appContent = appContent.replace(/import CreateNotePage from '\.\/components\/CreateNotePage';\n/g, '');
appContent = appContent.replace(/<Route path="\/[^"]+\/notes\/create" element=\{<CreateNotePage \/>\} \/>\n?\s*/g, '');
fs.writeFileSync(appJsPath, appContent, 'utf8');

console.log('Transformed CreateNotePage to CreateNoteModal and integrated it correctly.');
