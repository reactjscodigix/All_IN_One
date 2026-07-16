const fs = require('fs');

// 1. Revert CreateNotePage.js
const pagePath = 'client/src/components/CreateNotePage.js';
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Revert Modal wrapping
pageContent = pageContent.replace(
  /const CreateNoteModal = \(\{ isOpen, onClose, onSave \}\) => \{/g,
  `const CreateNotePage = () => {`
);

pageContent = pageContent.replace(
  /if \(!isOpen\) return null;\n\s*const handlePublish = async \(\) => \{/g,
  `const handlePublish = async () => {`
);

pageContent = pageContent.replace(/onClose\(\)/g, 'navigate(-1)');
pageContent = pageContent.replace(
  /if \(onSave\) onSave\(\);\n\s*navigate\(-1\);/g,
  `navigate(\`/\${dept}/manager/\${username}/notes\`);`
);

// Revert the overlay divs
pageContent = pageContent.replace(
  /<div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900\/50 p-4 sm:p-6 lg:p-8">\n\s*<div className="bg-gray-50 flex flex-col font-sans rounded-xl overflow-hidden w-full max-w-7xl max-h-\[95vh\] shadow-2xl relative">/g,
  `<div className="min-h-screen bg-gray-50 flex flex-col font-sans">`
);

// Remove the two extra closing divs at the very end
// We need to replace the last occurrence of:
//       </div>
//       </div>
//     </div>
//   );
// };
pageContent = pageContent.replace(
  /      <\/div>\n      <\/div>\n    <\/div>\n  \);\n\};/g,
  `    </div>\n  );\n};`
);

// We need to just ensure the bottom matches exactly. Let's just do a regex replace for the end part.
pageContent = pageContent.replace(/export default CreateNoteModal;/g, 'export default CreateNotePage;');

fs.writeFileSync(pagePath, pageContent, 'utf8');

// 2. Revert ITNotesPage.js
const notesPath = 'client/src/components/ITNotesPage.js';
let notesContent = fs.readFileSync(notesPath, 'utf8');

notesContent = notesContent.replace(/import CreateNoteModal from '\.\/CreateNoteModal';\n/g, '');
notesContent = notesContent.replace(/  const \[isCreateModalOpen, setIsCreateModalOpen\] = useState\(false\);\n/g, '');

// Revert onClick handlers back to navigate
notesContent = notesContent.replace(
  /onClick=\{\(\) => setIsCreateModalOpen\(true\)\}/g,
  `onClick={() => navigate(\`/\${isIT ? 'it' : 'seo-gmb'}/\${designation || 'manager'}/\${username || 'ashwini'}/notes/create\`)}`
);

// Remove the modal from the bottom
notesContent = notesContent.replace(
  /  <CreateNoteModal[\s\S]*?<\/div>\n    <\/div>\n  \);\n\}/g,
  `      </div>\n    </div>\n  );\n}`
);

fs.writeFileSync(notesPath, notesContent, 'utf8');

// 3. Revert App.js
const appJsPath = 'client/src/App.js';
let appContent = fs.readFileSync(appJsPath, 'utf8');

if (!appContent.includes('CreateNotePage')) {
  appContent = appContent.replace(
    /import ITNotesPage from '\.\/components\/ITNotesPage';/,
    `import ITNotesPage from './components/ITNotesPage';\nimport CreateNotePage from './components/CreateNotePage';`
  );
  appContent = appContent.replace(
    /<Route path="\/it\/:designation\/:username\/notes" element=\{<ITNotesPage \/>\} \/>/,
    `<Route path="/it/:designation/:username/notes" element={<ITNotesPage />} />\n        <Route path="/:dept/:designation/:username/notes/create" element={<CreateNotePage />} />`
  );
  fs.writeFileSync(appJsPath, appContent, 'utf8');
}

console.log('Reverted modal to full page routing.');
