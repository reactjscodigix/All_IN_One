const fs = require('fs');
const path = 'client/src/components/SeoGmbDocumentsPage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add filter states
content = content.replace(
  /const \[loading, setLoading\] = useState\(true\);/g,
  `const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedFileType, setSelectedFileType] = useState('All File Types');
  const [selectedFolder, setSelectedFolder] = useState('All Documents');`
);

// 2. Add extra fields to formattedFiles
content = content.replace(
  /version: f\.version \|\| 'v1\.0',\s*color: 'text-indigo-500'/g,
  `version: f.version || 'v1.0',\n              color: 'text-indigo-500',\n              folder: f.folder || '',\n              access: f.access_permission || 'Private',\n              created_at: f.created_at`
);

// 3. Compute derived stats and filtered list
content = content.replace(
  /const docsList = files;/g,
  `// Derived stats
  const totalDocuments = files.length;
  const uniqueFolders = [...new Set(files.map(f => f.folder).filter(Boolean))];
  const totalFolders = uniqueFolders.length;
  const pdfDocuments = files.filter(f => f.type === 'PDF').length;
  const recentDocumentsCount = files.filter(f => {
    if (!f.created_at) return false;
    const diff = (new Date() - new Date(f.created_at)) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  }).length;
  const sharedDocuments = files.filter(f => f.access !== 'Private').length;
  
  // Calculate folder counts for sidebar
  const folderCounts = uniqueFolders.reduce((acc, folder) => {
    acc[folder] = files.filter(f => f.folder === folder).length;
    return acc;
  }, {});

  // Extract unique projects, categories, file types for filters
  const uniqueProjects = ['All Projects', ...new Set(files.map(f => f.project).filter(Boolean))];
  const uniqueCategories = ['All Categories', ...new Set(files.map(f => f.category).filter(Boolean))];
  const uniqueFileTypes = ['All File Types', ...new Set(files.map(f => f.type).filter(Boolean))];

  // Filtering logic
  const filteredFiles = files.filter(f => {
    if (searchTerm && !f.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedProject !== 'All Projects' && f.project !== selectedProject) return false;
    if (selectedCategory !== 'All Categories' && f.category !== selectedCategory) return false;
    if (selectedFileType !== 'All File Types' && f.type !== selectedFileType) return false;
    if (selectedFolder !== 'All Documents' && f.folder !== selectedFolder) return false;
    return true;
  });`
);

// 4. Update KPI Cards
content = content.replace(
  /\{ title: 'Total Documents', val: '248'/g,
  `{ title: 'Total Documents', val: totalDocuments.toString()`
);
content = content.replace(
  /\{ title: 'Total Folders', val: '36'/g,
  `{ title: 'Total Folders', val: totalFolders.toString()`
);
content = content.replace(
  /\{ title: 'PDF Documents', val: '196'/g,
  `{ title: 'PDF Documents', val: pdfDocuments.toString()`
);
content = content.replace(
  /\{ title: 'Recently Added', val: '12'/g,
  `{ title: 'Recently Added', val: recentDocumentsCount.toString()`
);
content = content.replace(
  /\{ title: 'Shared Documents', val: '48'/g,
  `{ title: 'Shared Documents', val: sharedDocuments.toString()`
);

// 5. Update Filters UI
content = content.replace(
  /<input type="text" placeholder="Search documents by name\.\.\." className="w-full/g,
  `<input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search documents by name..." className="w-full`
);

content = content.replace(
  /\{ \['All Projects', 'All Categories', 'All File Types', 'Uploaded By'\]\.map\(\(f, i\) => \(\s*<div key=\{i\} className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded cursor-pointer  hover:bg-gray-50 transition-colors">\s*<span className="text-\[11px\] font-medium text-gray-700 whitespace-nowrap">\{f\}<\/span>\s*<ChevronDown size=\{14\} className="text-gray-400" \/>\s*<\/div>\s*\)\}/g,
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
    </div>`
);

content = content.replace(
  /<button className="p-2 text-indigo-600 bg-indigo-50 rounded text-\[11px\] font-medium hover:bg-indigo-100 transition-colors">\s*Reset\s*<\/button>/g,
  `<button onClick={() => { setSearchTerm(''); setSelectedProject('All Projects'); setSelectedCategory('All Categories'); setSelectedFileType('All File Types'); setSelectedFolder('All Documents'); }} className="p-2 text-indigo-600 bg-indigo-50 rounded text-sm font-medium hover:bg-indigo-100 transition-colors">Reset</button>`
);

// 6. Update Documents Table usage
content = content.replace(
  /Documents List <span className="text-gray-500 font-normal">\(Total: 248\)<\/span>/g,
  `Documents List <span className="text-gray-500 font-normal">(Total: {filteredFiles.length})</span>`
);

content = content.replace(
  /\{docsList\.map\(\(doc, idx\) => \(/g,
  `{filteredFiles.length === 0 ? <tr><td colSpan="10" className="py-8 text-center text-gray-500 text-sm">No documents found matching your filters.</td></tr> : filteredFiles.slice(0, 10).map((doc, idx) => (`
);

content = content.replace(
  /Showing 1 to 10 of 248 entries/g,
  `Showing 1 to {Math.min(10, filteredFiles.length)} of {filteredFiles.length} entries`
);

// 7. Update Quick Access
content = content.replace(
  /count: 12 \},/g,
  `count: recentDocumentsCount },`
);
content = content.replace(
  /count: 18 \},/g,
  `count: 0 },`
);
content = content.replace(
  /count: 48 \},/g,
  `count: sharedDocuments },`
);
content = content.replace(
  /count: 7 \},/g,
  `count: 0 },`
);

// 8. Update Folders Section
content = content.replace(
  /<span className="text-\[10px\]  text-indigo-700">248<\/span>/g,
  `<span className="text-xs  text-indigo-700">{totalDocuments}</span>`
);
content = content.replace(
  /<div className="flex items-center justify-between p-2 bg-indigo-50\/50 rounded cursor-pointer">/g,
  `<div onClick={() => setSelectedFolder('All Documents')} className={\`flex items-center justify-between p-2 rounded cursor-pointer transition-colors \${selectedFolder === 'All Documents' ? 'bg-indigo-50/50' : 'hover:bg-gray-50'}\`}>`
);

content = content.replace(
  /<div className="pl-4 space-y-1">\s*<div className="flex items-center justify-between p-1\.5 hover:bg-gray-50 rounded cursor-pointer group">\s*<div className="flex items-center gap-2">\s*<ChevronDown size=\{12\} className="text-gray-400 rotate-\[-90deg\]" \/>\s*<Folder size=\{12\} className="text-blue-500" \/>\s*<span className="text-\[11px\] font-medium text-gray-700 group-hover:text-gray-900">01\. Project Documents<\/span>\s*<\/div>\s*<span className="text-\[10px\] font-medium text-gray-500">96<\/span>\s*<\/div>[\s\S]*?<\/div>\s*\{\[/g,
  `<div className="pl-4 space-y-1">
    {uniqueFolders.map((folder, i) => (
      <div key={i} onClick={() => setSelectedFolder(folder)} className={\`flex items-center justify-between p-1.5 rounded cursor-pointer group transition-colors \${selectedFolder === folder ? 'bg-indigo-50' : 'hover:bg-gray-50'}\`}>
        <div className="flex items-center gap-2">
          <Folder size={12} className={selectedFolder === folder ? "text-indigo-600" : "text-blue-500"} />
          <span className={\`text-sm font-medium group-hover:text-gray-900 \${selectedFolder === folder ? 'text-indigo-700' : 'text-gray-700'}\`}>{folder}</span>
        </div>
        <span className="text-xs font-medium text-gray-500">{folderCounts[folder]}</span>
      </div>
    ))}
    {`
);
content = content.replace(
  /\{ name: '02\. Technical Documents', count: 45, color: 'text-indigo-500' \},[\s\S]*?\].map\(\(f, i\) => \([\s\S]*?<\/div>\s*\)\)\}/g,
  `[]}` // Remove the hardcoded list of other folders entirely
);

// Remove the `docsList.slice(0, 4)` in recent documents and use `filteredFiles`
content = content.replace(
  /\{docsList\.slice\(0, 4\)\.map/g,
  `{filteredFiles.slice(0, 4).map`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched SeoGmbDocumentsPage filters and real data.');
