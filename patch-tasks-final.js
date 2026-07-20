const fs = require('fs');
const path = 'client/src/components/ITTasksPage.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add pagination state
content = content.replace(
  /const \[tasks, setTasks\] = useState\(\[\]\);/,
  `const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(tasks.length / rowsPerPage);
  const paginatedTasks = tasks.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);`
);

// 2. Add Create Issue button
content = content.replace(
  /<button className="text-xs text-blue-600 font-medium hover:underline ml-2">Save filter<\/button>/,
  `<button onClick={() => setIsCreateDrawerOpen(true)} className="flex items-center gap-1.5 p-2 rounded text-xs  bg-blue-600 text-white hover:bg-blue-700 transition-colors ml-4 ">
    <Plus size={14} /> Create Issue
  </button>`
);

// 3. Update table body to use paginatedTasks and empty state
content = content.replace(
  /{tasks\.map\(\(row, i\) => \(/,
  `{tasks.length === 0 ? (
                        <tr>
                          <td colSpan="100%" className="p-12 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-400">
                              <LayoutList size={40} className="mb-3 opacity-30" />
                              <span className="text-sm font-semibold text-gray-600 mb-1">No issues found</span>
                              <span className="text-xs mb-4">There are no tasks matching your current filters or in your database.</span>
                              <button onClick={() => setIsCreateDrawerOpen(true)} className="p-2 bg-blue-600 text-white rounded text-xs  hover:bg-blue-700 transition  flex items-center gap-1.5"><Plus size={14} /> Create your first issue</button>
                            </div>
                          </td>
                        </tr>
                      ) : paginatedTasks.map((row, i) => (`
);

// 4. Update the index counter in the table row
content = content.replace(
  /<td className="p-3 text-center text-gray-400 text-xs">\{i \+ 1\}<\/td>/,
  `<td className="p-3 text-center text-gray-400 text-xs">{(currentPage - 1) * rowsPerPage + i + 1}</td>`
);

// 5. Update pagination UI at the bottom
const oldPaginationRegex = /<div className="flex items-center justify-between mt-4 text-xs text-gray-500">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
const newPagination = `<div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                  <span>{tasks.length === 0 ? '0 issues' : \`\${(currentPage - 1) * rowsPerPage + 1}-\${Math.min(currentPage * rowsPerPage, tasks.length)} of \${tasks.length} issues\`}</span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100 disabled:opacity-50"
                    >{'<'}</button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button 
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={\`w-6 h-6 flex items-center justify-center rounded \${currentPage === page ? 'bg-blue-600 text-white font-medium' : 'hover:bg-gray-100'}\`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                    >{'>'}</button>
                  </div>
                </div>
              </div>
            </div>`;

content = content.replace(oldPaginationRegex, newPagination);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched ITTasksPage.js pagination, empty state, and create button.');
