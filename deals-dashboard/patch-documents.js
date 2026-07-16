const fs = require('fs');
const path = 'client/src/components/SeoGmbDocumentsPage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Make sure axios and useNavigate are imported
if (!content.includes('import axios')) {
  content = content.replace(
    /import \{ useLocation/g,
    `import { useLocation, useNavigate`
  );
  content = content.replace(
    /import \{ useAuth \} from '\.\.\/hooks\/useAuth';/g,
    `import { useAuth } from '../hooks/useAuth';\nimport axios from 'axios';`
  );
} else if (!content.includes('useNavigate')) {
  content = content.replace(
    /import \{ useLocation \}/g,
    `import { useLocation, useNavigate }`
  );
}

// 2. Add navigation to the component
content = content.replace(
  /const isIT = location\.pathname\.includes\('\/it\/'\);/g,
  `const isIT = location.pathname.includes('/it/');\n  const navigate = useNavigate();`
);

// 3. Update useEffect to fetch from real API if isIT
content = content.replace(
  /const fetchFiles = async \(\) => \{[\s\S]*?fetchFiles\(\);\n  \}, \[\]\);/g,
  `const fetchFiles = async () => {
      try {
        setLoading(true);
        if (isIT) {
          const res = await axios.get('http://localhost:5000/api/it-documents');
          const formattedFiles = res.data.map(f => {
            const dateObj = new Date(f.created_at);
            return {
              id: f.id,
              name: f.title || 'Untitled Document',
              sub: f.description || 'Document',
              project: f.project || 'General',
              category: f.category || 'Files',
              type: (f.file_type || 'PDF').toUpperCase(),
              size: '1.2 MB', // Simulated
              by: f.created_by || 'User',
              date: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
              version: f.version || 'v1.0',
              color: 'text-indigo-500'
            };
          });
          setFiles(formattedFiles);
        } else {
          // Keep existing logic for SEO
          if (filesAPI && filesAPI.getAll) {
            const res = await filesAPI.getAll();
            const formattedFiles = (res || []).map((f, i) => {
              const dateObj = f.created_at ? new Date(f.created_at) : new Date();
              return {
                id: f.id || i,
                name: f.name || 'Unknown File',
                sub: 'Document',
                project: 'General',
                category: 'Content Files',
                type: (f.file_type || 'PDF').toUpperCase(),
                size: f.size_bytes ? (f.size_bytes / 1024 / 1024).toFixed(2) + ' MB' : '1.2 MB',
                by: 'User',
                date: dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                version: 'v1.0',
                color: 'text-indigo-500'
              };
            });
            setFiles(formattedFiles);
          }
        }
      } catch (err) {
        console.error('Failed to fetch files:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [isIT]);`
);

// 4. Remove dummy data mapping
content = content.replace(
  /const docsList = files\.length > 0 \? files : \[[\s\S]*?\];/g,
  `const docsList = files;`
);

// 5. Wire the Upload button
content = content.replace(
  /<button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-\[11px\] font-medium flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-colors">/g,
  `<button onClick={() => navigate(\`/\${isIT ? 'it' : 'seo-gmb'}/manager/\${user?.username || 'ashwini'}/documents/upload\`)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-[11px] font-medium flex items-center gap-2 shadow-sm hover:bg-gray-50 transition-colors">`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched SeoGmbDocumentsPage.js');
