const fs = require('fs');

// 1. Update App.js
const appJsPath = 'client/src/App.js';
let appContent = fs.readFileSync(appJsPath, 'utf8');

if (!appContent.includes('CreateNotePage')) {
  // Import
  appContent = appContent.replace(
    /import ITNotesPage from '\.\/components\/ITNotesPage';/,
    `import ITNotesPage from './components/ITNotesPage';\nimport CreateNotePage from './components/CreateNotePage';`
  );
  // Route
  appContent = appContent.replace(
    /<Route path="\/it\/:designation\/:username\/notes" element=\{<ITNotesPage \/>\} \/>/,
    `<Route path="/it/:designation/:username/notes" element={<ITNotesPage />} />\n        <Route path="/:dept/:designation/:username/notes/create" element={<CreateNotePage />} />`
  );
  fs.writeFileSync(appJsPath, appContent, 'utf8');
}

// 2. Update ITNotesPage.js
const notesJsPath = 'client/src/components/ITNotesPage.js';
let notesContent = fs.readFileSync(notesJsPath, 'utf8');

// Imports
if (!notesContent.includes('import axios')) {
  notesContent = notesContent.replace(
    /import React, \{ useState, useMemo \} from 'react';/,
    `import React, { useState, useMemo, useEffect } from 'react';\nimport axios from 'axios';\nimport { useNavigate, useLocation, useParams } from 'react-router-dom';`
  );
}

// Remove ALL_NOTES mock
notesContent = notesContent.replace(
  /const ALL_NOTES = \[\s*\{[\s\S]*?\n\];/g,
  ''
);

// Inject logic into ITNotesPage
notesContent = notesContent.replace(
  /const ITNotesPage = \(\) => \{/g,
  `const ITNotesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, designation } = useParams();
  const isIT = location.pathname.includes('/it/');
  
  const [allNotes, setAllNotes] = useState([]);
  
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/notes');
        setAllNotes(res.data.map(n => {
          let extra = {};
          try {
            if (n.description && n.description.startsWith('{')) {
              extra = JSON.parse(n.description);
            }
          } catch(e) {}
          
          return {
            id: n.id,
            title: n.title,
            starred: n.is_important === 1,
            subtitle: extra.summary || 'Note Document',
            type: extra.type || 'Note',
            category: extra.category || 'General',
            updatedBy: n.created_by || 'Admin',
            updatedAt: new Date(n.created_at).toLocaleDateString(),
            time: new Date(n.created_at).toLocaleTimeString(),
            createdBy: n.created_by || 'Admin',
            createdAt: new Date(n.created_at).toLocaleString(),
            lastUpdated: new Date(n.created_at).toLocaleString(),
            tags: extra.tags ? extra.tags.split(',').map(t => t.trim()) : [],
            description: extra.content || n.description || '',
            attachments: [],
            recentInCategory: []
          };
        }));
      } catch (err) {
        console.error('Failed to fetch notes', err);
      }
    };
    fetchNotes();
  }, []);`
);

// Map the state to use allNotes instead of ALL_NOTES
notesContent = notesContent.replace(/ALL_NOTES/g, 'allNotes');

// Fix "Add Note" button to navigate to create page
notesContent = notesContent.replace(
  /<button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-\[11px\] font-medium flex items-center gap-2 shadow-sm hover:bg-indigo-700 transition-colors">/g,
  `<button onClick={() => navigate(\`/\${isIT ? 'it' : 'seo-gmb'}/\${designation || 'manager'}/\${username || 'ashwini'}/notes/create\`)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-[11px] font-medium flex items-center gap-2 shadow-sm hover:bg-indigo-700 transition-colors">`
);

fs.writeFileSync(notesJsPath, notesContent, 'utf8');
console.log('App.js and ITNotesPage.js patched successfully!');
