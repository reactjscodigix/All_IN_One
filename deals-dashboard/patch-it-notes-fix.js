const fs = require('fs');
const path = 'client/src/components/ITNotesPage.js';
let content = fs.readFileSync(path, 'utf8');

// The first patch replaced `ALL_NOTES` with `allNotes`, breaking the file. Let's fix that.
// First, inject the missing `allNotes` state and useEffect

const injection = `
  const navigate = useNavigate();
  const location = useLocation();
  const { username, designation } = useParams();
  const isIT = location.pathname.includes('/it/');
  
  const [allNotes, setAllNotes] = useState([]);
  
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/notes');
        const formatted = res.data.map(n => {
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
        });
        setAllNotes(formatted);
      } catch (err) {
        console.error('Failed to fetch notes', err);
      }
    };
    fetchNotes();
  }, []);
`;

// Inject into the component
content = content.replace(
  /export default function ITNotesPage\(\) \{/g,
  `export default function ITNotesPage() {\n${injection}`
);

// We must also fix `setSelectedNote(allNotes[0])` because initially `allNotes` is empty
content = content.replace(
  /const \[selectedNote, setSelectedNote\] = useState\(allNotes\[0\]\);/g,
  `const [selectedNote, setSelectedNote] = useState(null);
  
  useEffect(() => {
    if (allNotes.length > 0 && !selectedNote) {
      setSelectedNote(allNotes[0]);
    }
  }, [allNotes]);`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed ITNotesPage.js data fetching!');
