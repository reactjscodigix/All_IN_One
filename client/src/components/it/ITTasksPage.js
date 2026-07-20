import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search, ChevronDown, ChevronRight,
  Share2, Download, MoreHorizontal, LayoutList,
  CheckSquare, Plus, AlertCircle, ArrowUp, ArrowDown, Trash2
} from 'lucide-react';
import ITCreateIssueDrawer from './ITCreateIssueDrawer';
import ITIssueDetailsPanel from './ITIssueDetailsPanel';

const PRIORITY_ICONS = {
  High: <ArrowUp size={14} className="text-red-500" />,
  Medium: <ArrowUp size={14} className="text-orange-500" />,
  Low: <ArrowDown size={14} className="text-blue-500" />
};

const TYPE_ICONS = {
  Task: <CheckSquare size={14} className="text-blue-500 fill-blue-100" />,
  Story: <BookmarkIcon size={14} className="text-green-500 fill-green-100" />,
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

const LIST_DATA = [
  { key: 'WR-101', title: 'Create wireframes for homepage', type: 'Task', status: 'TO DO', assignee: 'Emma Johnson', priority: 'High', labels: ['Design', 'UI/UX'], sprint: 'Sprint 1', due: '28 May 2024' },
  { key: 'WR-105', title: 'Design homepage UI', type: 'Task', status: 'IN PROGRESS', assignee: 'Olivia Taylor', priority: 'High', labels: ['Design', 'UI'], sprint: 'Sprint 1', due: '31 May 2024' },
  { key: 'WR-109', title: 'Review homepage design', type: 'Task', status: 'IN REVIEW', assignee: 'Michael Brown', priority: 'High', labels: ['Review'], sprint: 'Sprint 1', due: '02 Jun 2024' },
  { key: 'WR-113', title: 'Test login functionality', type: 'Test', status: 'TESTING', assignee: 'Sophia Davis', priority: 'High', labels: ['Testing'], sprint: 'Sprint 2', due: '06 Jun 2024' },
  { key: 'WR-117', title: 'Project kickoff meeting', type: 'Task', status: 'DONE', assignee: 'Emma Johnson', priority: 'Low', labels: ['Management'], sprint: '-', due: '01 May 2024' },
  { key: 'WR-102', title: 'Setup development environment', type: 'Task', status: 'TO DO', assignee: 'James Wilson', priority: 'Medium', labels: ['DevOps', 'Setup'], sprint: 'Sprint 1', due: '29 May 2024' },
  { key: 'WR-106', title: 'Implement authentication API', type: 'Story', status: 'IN PROGRESS', assignee: 'Daniel Martinez', priority: 'High', labels: ['Backend', 'API'], sprint: 'Sprint 1', due: '03 Jun 2024' },
  { key: 'WR-114', title: 'Cross-browser testing', type: 'Test', status: 'TESTING', assignee: 'Ava Thomas', priority: 'Medium', labels: ['Testing'], sprint: 'Sprint 2', due: '06 Jun 2024' },
];

const ALL_COLUMNS = [
  { key: 'workType', label: 'Work type', defaultChecked: true },
  { key: 'key', label: 'Work item key', defaultChecked: true },
  { key: 'summary', label: 'Summary', defaultChecked: true },
  { key: 'assignee', label: 'Assignee', defaultChecked: true },
  { key: 'reporter', label: 'Reporter', defaultChecked: true },
  { key: 'priority', label: 'Priority', defaultChecked: true },
  { key: 'status', label: 'Status', defaultChecked: true },
  { key: 'resolution', label: 'Resolution', defaultChecked: true },
  { key: 'created', label: 'Created', defaultChecked: true },
  { key: 'updated', label: 'Updated', defaultChecked: true },
  { key: 'dueDate', label: 'Due date', defaultChecked: true },
  { key: 'actions', label: 'Actions', defaultChecked: true },

  { key: 'progress', label: 'Progress', defaultChecked: false },
  { key: 'remainingEstimate', label: 'Remaining Estimate', defaultChecked: false },
  { key: 'originalEstimate', label: 'Original Estimate', defaultChecked: false },
  { key: 'timeSpent', label: 'Time Spent', defaultChecked: false },
  { key: 'comments', label: 'Comments', defaultChecked: false },
  { key: 'components', label: 'Components', defaultChecked: false },
  { key: 'confluenceItems', label: 'Confluence items', defaultChecked: false },
  { key: 'creator', label: 'Creator', defaultChecked: false },
  { key: 'development', label: 'Development', defaultChecked: false },
  { key: 'issueColor', label: 'Issue color', defaultChecked: false },
  { key: 'rank', label: 'Rank', defaultChecked: false },
  { key: 'vulnerability', label: 'Vulnerability', defaultChecked: false },
  { key: 'description', label: 'Description', defaultChecked: false },
  { key: 'environment', label: 'Environment', defaultChecked: false },
  { key: 'fixVersions', label: 'Fix versions', defaultChecked: false },
  { key: 'flagged', label: 'Flagged', defaultChecked: false },
  { key: 'linkedWorkItems', label: 'Linked work items', defaultChecked: false },
  { key: 'labels', label: 'Labels', defaultChecked: false },
  { key: 'lastViewed', label: 'Last Viewed', defaultChecked: false },
  { key: 'parent', label: 'Parent', defaultChecked: false },
  { key: 'space', label: 'Space', defaultChecked: false },
  { key: 'resolved', label: 'Resolved', defaultChecked: false },
  { key: 'securityLevel', label: 'Security Level', defaultChecked: false },
  { key: 'startDate', label: 'Start date', defaultChecked: false },
  { key: 'statusCategory', label: 'Status Category', defaultChecked: false },
  { key: 'statusCategoryChanged', label: 'Status Category Changed', defaultChecked: false },
  { key: 'subTasks', label: 'Sub-tasks', defaultChecked: false },
  { key: 'team', label: 'Team', defaultChecked: false },
  { key: 'images', label: 'Images', defaultChecked: false },
  { key: 'affectsVersions', label: 'Affects versions', defaultChecked: false },
  { key: 'votes', label: 'Votes', defaultChecked: false },
  { key: 'watchers', label: 'Watchers', defaultChecked: false },
  { key: 'workRatio', label: 'Work Ratio', defaultChecked: false }
];

const ITTasksPage = () => {
  const { username } = useParams();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [openFilterDropdown, setOpenFilterDropdown] = useState(null);

  // Columns filter state
  const [selectedColumns, setSelectedColumns] = useState(
    new Set(['workType', 'key', 'summary', 'assignee', 'reporter', 'priority', 'status', 'resolution', 'created', 'updated', 'dueDate'])
  );
  const [columnSearchQuery, setColumnSearchQuery] = useState('');
  const [activeColumnsTab, setActiveColumnsTab] = useState('My defaults');

  const [tasks, setTasks] = useState([]);

  const filteredTasks = React.useMemo(() => {
    if (!username) return tasks;
    return tasks.filter(task => {
      if (!task.assignee) return false;
      return task.assignee.toLowerCase().includes(username.toLowerCase());
    });
  }, [tasks, username]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(filteredTasks.length / rowsPerPage) || 1;
  const paginatedTasks = filteredTasks.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const ticketKey = params.get('ticketKey');
      if (ticketKey) {
        const exists = tasks.some(t => t.issue_key === ticketKey || t.key === ticketKey);
        if (exists) {
          setSelectedIssue(ticketKey);
        }
      }
    }
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/it-kanban/issues');
      if (res.ok) {
        const data = await res.json();
        // The list page expects some fields to be formatted slightly differently (e.g. summary instead of title, though we can use title)
        // But our ITIssueDetailsPanel expects issue.key and issue.title etc.
        setTasks(data);
      }
    } catch (err) {
      console.error('Error fetching tasks', err);
    }
  };

  const updateIssue = async (key, updates) => {
    // Optimistic local update
    setTasks(prev => prev.map(t => t.issue_key === key || t.key === key ? { ...t, ...updates } : t));
    try {
      await fetch(`http://localhost:5000/api/it-kanban/issues/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.error('Failed to update issue', err);
    }
  };

  const deleteIssue = async (key) => {
    try {
      await fetch(`http://localhost:5000/api/it-kanban/issues/${key}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.issue_key !== key && t.key !== key));
      setSelectedIssue(null);
    } catch (err) {
      console.error('Failed to delete issue', err);
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
      <ITCreateIssueDrawer isOpen={isCreateDrawerOpen} onIssueCreated={fetchTasks} onClose={() => setIsCreateDrawerOpen(false)} />
      <div className="flex w-full h-screen bg-white overflow-hidden font-sans">
        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-y-auto flex relative">

            {/* BOARD & LIST */}
            <div className="flex-1 flex flex-col p-4 pb-0 min-w-0 bg-white">

              <div className="flex items-end justify-between mb-6">
                <div>
                  <h1 className="text-2xl text-gray-900 mb-4">All Issues</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                      <input type="text" placeholder="Search issues" className="pl-8 pr-3 py-1.5 bg-gray-50 border-none rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-300 w-40" />
                    </div>

                    {/* Project Dropdown */}
                    <div className="relative interactive-dropdown">
                      <button onClick={() => toggleDropdown('project')} className="flex items-center gap-1.5 p-2 rounded text-sm font-medium border bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-100 transition-colors">
                        Project: Website Redesign <ChevronDown size={14} />
                      </button>
                      {openFilterDropdown === 'project' && (
                        <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-30 text-xs">
                          {['Website Redesign (WR)', 'Mobile App (MA)', 'Backend API (BA)'].map(p => (
                            <div key={p} className="p-2 hover:bg-gray-50 cursor-pointer text-gray-700 font-medium">{p}</div>
                          ))}
                        </div>
                      )}
                    </div>



                    <button onClick={() => setIsCreateDrawerOpen(true)} className="flex items-center gap-1.5 p-2 rounded text-sm  bg-blue-600 text-white hover:bg-blue-700 transition-colors ml-4 ">
                      <Plus size={14} /> Create Issue
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative interactive-dropdown">
                    <button onClick={() => toggleDropdown('share')} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium"><Share2 size={14} /> Share</button>
                    {openFilterDropdown === 'share' && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-30 text-xs">
                        <div className="p-2 hover:bg-gray-50 cursor-pointer text-gray-700">Copy link</div>
                        <div className="p-2 hover:bg-gray-50 cursor-pointer text-gray-700">Email</div>
                      </div>
                    )}
                  </div>

                  <div className="relative interactive-dropdown">
                    <button onClick={() => toggleDropdown('export')} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium"><Download size={14} /> Export</button>
                    {openFilterDropdown === 'export' && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-30 text-xs">
                        <div className="p-2 hover:bg-gray-50 cursor-pointer text-gray-700">Export Excel</div>
                        <div className="p-2 hover:bg-gray-50 cursor-pointer text-gray-700">Export CSV</div>
                      </div>
                    )}
                  </div>

                  <div className="relative interactive-dropdown">
                    <button onClick={() => toggleDropdown('moreOptions')} className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16} /></button>
                    {openFilterDropdown === 'moreOptions' && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-30 text-xs">
                        <div className="p-2 hover:bg-gray-50 cursor-pointer text-gray-700">Bulk modify</div>
                        <div className="p-2 hover:bg-gray-50 cursor-pointer text-gray-700">Import issues</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* METRICS ROW */}


              {/* LIST VIEW */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-900">All Issues</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 rounded-full">{tasks.length}</span>
                  </div>

                  {/* Columns dropdown trigger */}
                  <div className="relative interactive-dropdown">
                    <button
                      onClick={() => toggleDropdown('columns')}
                      className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 p-2 rounded border border-gray-200  transition-all"
                    >
                      <LayoutList size={14} /> Columns <ChevronDown size={14} />
                    </button>

                    {openFilterDropdown === 'columns' && (
                      <div className="absolute right-0 top-full mt-1.5 w-72 bg-white border border-gray-200 rounded shadow-xl z-50 flex flex-col font-sans text-xs text-gray-700 py-1.5">

                        {/* Tab Headers */}
                        <div className="flex border-b border-gray-100 px-3 pb-1">
                          <button
                            onClick={() => setActiveColumnsTab('My defaults')}
                            className={`pb-1 px-2 font-medium transition-all relative ${activeColumnsTab === 'My defaults' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                              }`}
                          >
                            My defaults
                            {activeColumnsTab === 'My defaults' && (
                              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500" />
                            )}
                          </button>
                          <button
                            onClick={() => setActiveColumnsTab('System')}
                            className={`pb-1 px-2 font-medium transition-all relative ${activeColumnsTab === 'System' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
                              }`}
                          >
                            System
                            {activeColumnsTab === 'System' && (
                              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500" />
                            )}
                          </button>
                        </div>

                        {/* Search columns */}
                        <div className="p-2 border-b border-gray-100 relative flex items-center">
                          <Search size={12} className="absolute left-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search columns"
                            className="w-full pl-7 pr-3 py-1.5 border border-blue-500 rounded-[3px] text-xs outline-none focus:ring-1 focus:ring-blue-400"
                            value={columnSearchQuery}
                            onChange={(e) => setColumnSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>

                        {/* Columns list */}
                        <div className="max-h-72 overflow-y-auto px-1 py-1 custom-scrollbar">
                          {ALL_COLUMNS.filter(col =>
                            col.label.toLowerCase().includes(columnSearchQuery.toLowerCase())
                          ).map(col => {
                            const isChecked = selectedColumns.has(col.key);
                            return (
                              <label
                                key={col.key}
                                className="flex items-center gap-2.5 p-2 hover:bg-gray-50 cursor-pointer rounded"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    const next = new Set(selectedColumns);
                                    if (isChecked) {
                                      // Summary is required
                                      if (col.key !== 'summary') {
                                        next.delete(col.key);
                                      }
                                    } else {
                                      next.add(col.key);
                                    }
                                    setSelectedColumns(next);
                                  }}
                                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500/20"
                                />
                                <span className={`${isChecked ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{col.label}</span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Dropdown footer */}
                        <div className="flex justify-between items-center px-3 pt-2 pb-0.5 border-t border-gray-100 text-xs text-gray-500">
                          <button
                            className="text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
                            onClick={() => {
                              const defaultKeys = ALL_COLUMNS.filter(c => c.defaultChecked).map(c => c.key);
                              setSelectedColumns(new Set(defaultKeys));
                            }}
                          >
                            + Restore defaults
                          </button>
                          <span>{selectedColumns.size} of 48</span>
                        </div>

                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-gray-200 rounded bg-white overflow-x-auto w-full max-w-full">
                  <table className="w-full text-left whitespace-nowrap overflow-auto">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500   tracking-wider">
                      <tr>
                        <th className="p-3 w-10 text-center">#</th>
                        {ALL_COLUMNS.filter(col => selectedColumns.has(col.key)).map(col => (
                          <th key={col.key} className="p-3 select-none">{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                      {tasks.length === 0 ? (
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
                      ) : paginatedTasks.map((row, i) => (
                        <tr key={i} className={`hover:bg-blue-50 cursor-pointer ${selectedIssue === (row.issue_key || row.key) ? 'bg-blue-50' : ''}`} onClick={() => setSelectedIssue((row.issue_key || row.key))}>
                          <td className="p-3 text-center text-gray-400 text-xs">{(currentPage - 1) * rowsPerPage + i + 1}</td>
                          {ALL_COLUMNS.filter(col => selectedColumns.has(col.key)).map(col => {
                            switch (col.key) {
                              case 'workType':
                                return (
                                  <td key={col.key} className="p-3">
                                    <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                                      {TYPE_ICONS[row.type] || TYPE_ICONS.Task} {row.type}
                                    </div>
                                  </td>
                                );
                              case 'key':
                                return (
                                  <td key={col.key} className="p-3 text-blue-600 font-semibold hover:underline">
                                    {(row.issue_key || row.key)}
                                  </td>
                                );
                              case 'summary':
                                return (
                                  <td key={col.key} className="p-3 text-gray-900 font-semibold truncate max-w-xs">
                                    {row.title}
                                  </td>
                                );
                              case 'assignee':
                                return (
                                  <td key={col.key} className="p-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] ">
                                        {(row.assignee ? row.assignee.charAt(0) : "U")}
                                      </div>
                                      <span>{row.assignee || "Unassigned"}</span>
                                    </div>
                                  </td>
                                );
                              case 'reporter':
                                return (
                                  <td key={col.key} className="p-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] ">
                                        P
                                      </div>
                                      <span>{row.reporter || "PM Admin"}</span>
                                    </div>
                                  </td>
                                );
                              case 'priority':
                                return (
                                  <td key={col.key} className="p-3">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                      {PRIORITY_ICONS[row.priority]} {row.priority}
                                    </div>
                                  </td>
                                );
                              case 'status':
                                return (
                                  <td key={col.key} className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-xs   tracking-wide border ${row.status === 'TO DO' ? 'bg-gray-100 text-gray-600 border-gray-200' :
                                      row.status === 'IN PROGRESS' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                        row.status === 'IN REVIEW' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                          row.status === 'TESTING' ? 'bg-green-100 text-green-700 border-green-200' :
                                            'bg-teal-100 text-teal-700 border-teal-200'
                                      }`}>
                                      {row.status}
                                    </span>
                                  </td>
                                );
                              case 'resolution':
                                return <td key={col.key} className="p-3 text-gray-500 font-medium">{row.status === 'DONE' ? 'Done' : 'Unresolved'}</td>;
                              case 'created':
                                return <td key={col.key} className="p-3 text-gray-500 font-medium">{row.created_at ? new Date(row.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>;
                              case 'updated':
                                return <td key={col.key} className="p-3 text-gray-500 font-medium">{row.updated_at ? new Date(row.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>;
                              case 'dueDate':
                                return <td key={col.key} className="p-3 text-gray-500 font-medium">{row.due_date ? new Date(row.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : row.due_date || '-'}</td>;
                              case 'actions':
                                return (
                                  <td key={col.key} className="p-3">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm(`Are you sure you want to delete ticket ${(row.issue_key || row.key)}?`)) {
                                          deleteIssue((row.issue_key || row.key));
                                        }
                                      }}
                                      className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors cursor-pointer flex items-center justify-center"
                                      title="Delete Ticket"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                );

                              // Unselected/extra columns mock renders
                              case 'progress':
                                return <td key={col.key} className="p-3 text-gray-700 ">{row.progress || 0}%</td>;
                              case 'remainingEstimate':
                                return <td key={col.key} className="p-3 text-gray-600">{row.remaining_estimate || '0h'}</td>;
                              case 'originalEstimate':
                                return <td key={col.key} className="p-3 text-gray-600">{row.original_estimate || '0h'}</td>;
                              case 'timeSpent':
                                return <td key={col.key} className="p-3 text-gray-600">{row.time_spent || '0h'}</td>;
                              case 'comments':
                                const commentCount = row.comments ? (Array.isArray(row.comments) ? row.comments.length : JSON.parse(row.comments).length) : 0;
                                return <td key={col.key} className="p-3 text-gray-600">{commentCount} Comments</td>;
                              case 'subTasks':
                                const subtaskCount = row.subtasks ? (Array.isArray(row.subtasks) ? row.subtasks.length : JSON.parse(row.subtasks).length) : 0;
                                return <td key={col.key} className="p-3 text-gray-600">{subtaskCount} Subtasks</td>;
                              case 'components':
                                return <td key={col.key} className="p-3 text-gray-600">{row.components || '-'}</td>;
                              case 'confluenceItems':
                                return <td key={col.key} className="p-3 text-gray-600">0 Links</td>;
                              case 'creator':
                                return <td key={col.key} className="p-3 text-gray-600">{row.reporter || 'System'}</td>;
                              case 'development':
                                return <td key={col.key} className="p-3 text-gray-600">0 Branches</td>;
                              case 'issueColor':
                                return (
                                  <td key={col.key} className="p-3">
                                    <div className="w-3.5 h-3.5 bg-blue-500 rounded-sm"></div>
                                  </td>
                                );
                              case 'rank':
                                return <td key={col.key} className="p-3 text-gray-600">High</td>;
                              case 'vulnerability':
                                return <td key={col.key} className="p-3 text-gray-600">None</td>;
                              case 'description':
                                return <td key={col.key} className="p-3 text-gray-500 truncate max-w-xs">Create wireframes and layout...</td>;
                              case 'environment':
                                return <td key={col.key} className="p-3 text-gray-600">Production</td>;
                              case 'fixVersions':
                                return <td key={col.key} className="p-3 text-gray-600">v1.0</td>;
                              case 'flagged':
                                return <td key={col.key} className="p-3 text-gray-600">No</td>;
                              case 'linkedWorkItems':
                                return <td key={col.key} className="p-3 text-gray-600">blocks WR-102</td>;
                              case 'labels':
                                return (
                                  <td key={col.key} className="p-3">
                                    <div className="flex items-center gap-1">
                                      {row.labels.map(l => (
                                        <span key={l} className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 rounded text-xs font-semibold">{l}</span>
                                      ))}
                                    </div>
                                  </td>
                                );
                              case 'lastViewed':
                                return <td key={col.key} className="p-3 text-gray-600">Just now</td>;
                              case 'parent':
                                return <td key={col.key} className="p-3 text-gray-600">Website Redesign</td>;
                              case 'space':
                                return <td key={col.key} className="p-3 text-gray-600">IT Workspace</td>;
                              case 'resolved':
                                return <td key={col.key} className="p-3 text-gray-600">-</td>;
                              case 'securityLevel':
                                return <td key={col.key} className="p-3 text-gray-600">Public</td>;
                              case 'startDate':
                                return <td key={col.key} className="p-3 text-gray-600">01 May 2024</td>;
                              case 'statusCategory':
                                return <td key={col.key} className="p-3 text-gray-600 font-medium">To Do</td>;
                              case 'statusCategoryChanged':
                                return <td key={col.key} className="p-3 text-gray-600 font-medium">01 May 2024</td>;
                              case 'subTasks':
                                return <td key={col.key} className="p-3 text-gray-600">0 Sub-tasks</td>;
                              case 'team':
                                return <td key={col.key} className="p-3 text-gray-600 font-semibold text-indigo-600">Frontend Team</td>;
                              case 'images':
                                return <td key={col.key} className="p-3 text-gray-600">1 Attachment</td>;
                              case 'affectsVersions':
                                return <td key={col.key} className="p-3 text-gray-600">v0.9</td>;
                              case 'votes':
                                return <td key={col.key} className="p-3 text-gray-600">2</td>;
                              case 'watchers':
                                return <td key={col.key} className="p-3 text-gray-600">5</td>;
                              case 'workRatio':
                                return <td key={col.key} className="p-3 text-gray-600">0.5</td>;
                              default:
                                return <td key={col.key} className="p-3 text-gray-500">-</td>;
                            }
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                  <span>{tasks.length === 0 ? '0 issues' : `${(currentPage - 1) * rowsPerPage + 1}-${Math.min(currentPage * rowsPerPage, tasks.length)} of ${tasks.length} issues`}</span>
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
                        className={`w-6 h-6 flex items-center justify-center rounded ${currentPage === page ? 'bg-blue-600 text-white font-medium' : 'hover:bg-gray-100'}`}
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
            </div>

            {/* RIGHT SIDE PANEL (ISSUE DETAILS) */}
            <ITIssueDetailsPanel
              issue={tasks.find(r => (r.issue_key || r.key) === selectedIssue)}
              updateIssue={updateIssue}
              deleteIssue={deleteIssue}
              onClose={() => setSelectedIssue(null)}
              onIssueCreated={fetchTasks}
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

export default ITTasksPage;
