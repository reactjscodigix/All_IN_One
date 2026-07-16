import React, { useState, useEffect } from 'react';
import {
  Search, ChevronDown, ChevronRight,
  Share2, Download, MoreHorizontal, LayoutList,
  CheckSquare, Plus, AlertCircle, ArrowUp, ArrowDown
} from 'lucide-react';
import ITCreateIssueDrawer from '../it/ITCreateIssueDrawer';
import ITIssueDetailsPanel from '../it/ITIssueDetailsPanel';
import { useAuth } from '../../hooks/useAuth';

const PRIORITY_ICONS = {
  High: <ArrowUp size={14} className="text-red-500" />,
  Medium: <ArrowUp size={14} className="text-orange-500" />,
  Low: <ArrowDown size={14} className="text-blue-500" />
};

const TYPE_ICONS = {
  Task: <CheckSquare size={14} className="text-blue-500 fill-blue-100" />,
  Story: <BookmarkIcon size={14} className="text-green-500 fill-green-100" />, // Using a generic icon for story
  Bug: <AlertCircle size={14} className="text-red-500 fill-red-100" />,
  Test: <TestTubeIcon size={14} className="text-purple-500 fill-purple-100" />
};

// SVG substitutes for lucide icons that might be missing or not perfectly matched
function BookmarkIcon(props) {
  return <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}><path d="M5 3v18l7-4.5 7 4.5V3z" /></svg>;
}
function TestTubeIcon(props) {
  return <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}><rect x="9" y="3" width="6" height="3" rx="1" /><path d="M10 6v11a2 2 0 004 0V6" /></svg>;
}

// KANBAN_DATA removed as it's not used here


const TasksPage = ({ department }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    try {
      const queryParams = new URLSearchParams({
        department: user?.department || '',
        user_id: user?.id || '',
        role: user?.role || ''
      });
      const res = await fetch(`http://localhost:5000/api/tasks?${queryParams}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Error fetching tasks', err);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openFilterDropdown && !e.target.closest('.interactive-dropdown')) {
        setOpenFilterDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFilterDropdown]);

  const toggleDropdown = (name) => {
    setOpenFilterDropdown(openFilterDropdown === name ? null : name);
  };

  return (
    <>
      <ITCreateIssueDrawer isOpen={isCreateDrawerOpen} onClose={() => setIsCreateDrawerOpen(false)} />
      <div className="flex w-full h-screen bg-white overflow-hidden font-sans">
        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">


          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto flex relative">

            {/* BOARD & LIST */}
            <div className="flex-1 flex flex-col p-4 pb-0 min-w-0 bg-white">

              <div className="flex items-end justify-between mb-6">
                <div>
                  <h1 className="text-2xl  text-gray-900 mb-4">All Issues</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                      <input type="text" placeholder="Search issues" className="pl-8 pr-3 py-1.5 bg-gray-50 border-none rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-300 w-40" />
                    </div>

                    {/* Project Dropdown */}
                    <div className="relative interactive-dropdown">
                      <button onClick={() => toggleDropdown('project')} className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100 transition-colors">
                        Project: Website Redesign <ChevronDown size={14} />
                      </button>
                      {openFilterDropdown === 'project' && (
                        <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-30 text-xs">
                          {['Website Redesign (WR)', 'Mobile App (MA)', 'Backend API (BA)'].map(p => (
                            <div key={p} className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700 font-medium">{p}</div>
                          ))}
                        </div>
                      )}
                    </div>



                    <button className="text-xs text-blue-600 font-medium hover:underline ml-2">Save filter</button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative interactive-dropdown">
                    <button onClick={() => toggleDropdown('share')} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium"><Share2 size={14} /> Share</button>
                    {openFilterDropdown === 'share' && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-30 text-xs">
                        <div className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700">Copy link</div>
                        <div className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700">Email</div>
                      </div>
                    )}
                  </div>

                  <div className="relative interactive-dropdown">
                    <button onClick={() => toggleDropdown('export')} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium"><Download size={14} /> Export</button>
                    {openFilterDropdown === 'export' && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-30 text-xs">
                        <div className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700">Export Excel</div>
                        <div className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700">Export CSV</div>
                      </div>
                    )}
                  </div>

                  <div className="relative interactive-dropdown">
                    <button onClick={() => toggleDropdown('moreOptions')} className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16} /></button>
                    {openFilterDropdown === 'moreOptions' && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-30 text-xs">
                        <div className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700">Bulk modify</div>
                        <div className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-gray-700">Import issues</div>
                      </div>
                    )}
                  </div>


                </div>
              </div>

              {/* METRICS ROW */}
              <div className="flex gap-4 mb-8 pb-2">
                {[
                  { label: 'All Issues', count: 128, icon: <LayoutList size={16} className="text-gray-500" />, color: 'text-gray-900' },
                  { label: 'To Do', count: 24, icon: <div className="w-4 h-4 rounded border-2 border-blue-500 bg-blue-100"></div>, color: 'text-gray-900' },
                  { label: 'In Progress', count: 36, icon: <div className="w-4 h-4 rounded border-2 border-orange-500 bg-orange-100"></div>, color: 'text-gray-900' },
                  { label: 'In Review', count: 18, icon: <div className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-100"></div>, color: 'text-gray-900' },
                  { label: 'Testing', count: 16, icon: <div className="w-4 h-4 rounded border-2 border-green-500 bg-green-100"></div>, color: 'text-gray-900' },
                  { label: 'Done', count: 30, icon: <CheckCircleIcon className="text-teal-500" />, color: 'text-gray-900' },
                  { label: 'Blocked', count: 4, icon: <AlertTriangleIcon className="text-red-500" />, color: 'text-red-600 border-red-200 bg-red-50' },
                ].map((m, i) => (
                  <div key={i} className={`flex-1 min-w-[120px] bg-white border ${m.label === 'Blocked' ? 'border-red-200' : 'border-gray-200'} rounded p-3 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs  ${m.label === 'Blocked' ? 'text-red-600' : 'text-gray-500 uppercase tracking-wider'}`}>{m.label}</span>
                      {m.icon}
                    </div>
                    <div className={`text-2xl  ${m.color}`}>{m.count}</div>
                  </div>
                ))}
              </div>



              {/* LIST VIEW */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm  text-gray-900">All Issues</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 rounded-full">128</span>
                  </div>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded border border-gray-200">
                    <LayoutList size={14} /> Columns <ChevronDown size={14} />
                  </button>
                </div>

                <div className="border border-gray-200 rounded  bg-white">
                  <table className="w-full text-left whitespace-nowrap overflow-auto">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 font-medium">
                      <tr>
                        <th className="p-3 w-10 text-center">#</th>
                        <th className="p-3">Key</th>
                        <th className="p-3">Summary</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Assignee</th>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Labels</th>
                        <th className="p-3">Sprint</th>
                        <th className="p-3">Due date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                      {tasks.map((row, i) => (
                        <tr key={i} className={`hover:bg-blue-50 cursor-pointer ${selectedIssue === row.key ? 'bg-blue-50' : ''}`} onClick={() => setSelectedIssue(row.key)}>
                          <td className="p-3 text-center text-gray-400 text-xs">{i + 1}</td>
                          <td className="p-3 text-blue-600 font-medium hover:underline">{row.key}</td>
                          <td className="p-3 text-gray-900 font-medium">{row.title}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                              {TYPE_ICONS[row.type] || TYPE_ICONS.Task} {row.type}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-xs  uppercase tracking-wide border ${row.status === 'TO DO' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                              row.status === 'IN PROGRESS' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                row.status === 'IN REVIEW' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                  row.status === 'TESTING' ? 'bg-green-100 text-green-700 border-green-200' :
                                    'bg-teal-100 text-teal-700 border-teal-200'
                              }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="p-3 flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] ">{row.assignee.charAt(0)}</div>
                            {row.assignee}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              {PRIORITY_ICONS[row.priority]} {row.priority}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1">
                              {row.labels.map(l => (
                                <span key={l} className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 rounded text-xs font-medium">{l}</span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-gray-600 text-xs">{row.sprint}</td>
                          <td className="p-3 text-gray-500 text-xs">{row.due}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                  <span>1-8 of 128 issues</span>
                  <div className="flex items-center gap-1">
                    <button className="w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:bg-gray-100">{'<'}</button>
                    <button className="w-6 h-6 flex items-center justify-center rounded bg-blue-600 text-white font-medium">1</button>
                    <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">2</button>
                    <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">3</button>
                    <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">4</button>
                    <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">5</button>
                    <span>...</span>
                    <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">16</button>
                    <button className="w-6 h-6 flex items-center justify-center rounded text-gray-600 hover:bg-gray-100">{'>'}</button>
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT SIDE PANEL (ISSUE DETAILS) */}
            <ITIssueDetailsPanel
              issue={tasks.find(r => r.key === selectedIssue)}
              onClose={() => setSelectedIssue(null)}
            />

          </div>
        </div>
        <style>{`
        .animate-slide-left { animation: slideLeft 0.3s ease-out forwards; }
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
      </div>
    </>
  );
};

// Reusable custom SVG icons to match the screenshot
const CheckCircleIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const AlertTriangleIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

export default TasksPage;
