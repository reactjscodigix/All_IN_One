const fs = require('fs');
const path = 'client/src/components/SeoGmbDocumentsPage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add selectedUploadedBy state
content = content.replace(
  /const \[selectedFileType, setSelectedFileType\] = useState\('All File Types'\);\n  const \[selectedFolder, setSelectedFolder\] = useState\('All Documents'\);/g,
  `const [selectedFileType, setSelectedFileType] = useState('All File Types');
  const [selectedFolder, setSelectedFolder] = useState('All Documents');
  const [selectedUploadedBy, setSelectedUploadedBy] = useState('Uploaded By');`
);

// 2. Add uniqueUploadedBy
content = content.replace(
  /const uniqueFileTypes = \['All File Types', \.\.\.new Set\(files\.map\(f => f\.type\)\.filter\(Boolean\)\)\];/g,
  `const uniqueFileTypes = ['All File Types', ...new Set(files.map(f => f.type).filter(Boolean))];
  const uniqueUploadedBy = ['Uploaded By', ...new Set(files.map(f => f.by).filter(Boolean))];`
);

// 3. Update filtering logic
content = content.replace(
  /if \(selectedFileType !== 'All File Types' && f\.type !== selectedFileType\) return false;\n    if \(selectedFolder !== 'All Documents' && f\.folder !== selectedFolder\) return false;/g,
  `if (selectedFileType !== 'All File Types' && f.type !== selectedFileType) return false;
    if (selectedFolder !== 'All Documents' && f.folder !== selectedFolder) return false;
    if (selectedUploadedBy !== 'Uploaded By' && f.by !== selectedUploadedBy) return false;`
);

// 4. Fix Reset button to clear selectedUploadedBy
content = content.replace(
  /setSelectedFolder\('All Documents'\); \}\} className="p-2 text-indigo-600 bg-indigo-50/g,
  `setSelectedFolder('All Documents'); setSelectedUploadedBy('Uploaded By'); }} className="p-2 text-indigo-600 bg-indigo-50`
);

// 5. Fix the filter dropdown rendering
content = content.replace(
  /\{?\['All Projects', 'All Categories', 'All File Types', 'Uploaded By'\]\.map\(\(f, i\) => \(\s*<div key=\{i\} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded cursor-pointer  hover:bg-gray-50 transition-colors">\s*<span className="text-\[11px\] font-medium text-gray-700 whitespace-nowrap">\{f\}<\/span>\s*<ChevronDown size=\{14\} className="text-gray-400" \/>\s*<\/div>\s*\)\}\}?/g,
  `<div className="relative">
              <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)} className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded text-sm font-medium text-gray-700 cursor-pointer  hover:bg-gray-50 appearance-none focus:outline-none">
                {uniqueProjects.map((p, i) => <option key={i} value={p}>{p}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded text-sm font-medium text-gray-700 cursor-pointer  hover:bg-gray-50 appearance-none focus:outline-none">
                {uniqueCategories.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={selectedFileType} onChange={e => setSelectedFileType(e.target.value)} className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded text-sm font-medium text-gray-700 cursor-pointer  hover:bg-gray-50 appearance-none focus:outline-none">
                {uniqueFileTypes.map((t, i) => <option key={i} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select value={selectedUploadedBy} onChange={e => setSelectedUploadedBy(e.target.value)} className="pl-3 pr-8 py-2 bg-white border border-gray-200 rounded text-sm font-medium text-gray-700 cursor-pointer  hover:bg-gray-50 appearance-none focus:outline-none">
                {uniqueUploadedBy.map((u, i) => <option key={i} value={u}>{u}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched dropdown rendering.');
