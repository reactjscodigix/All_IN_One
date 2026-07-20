import React, { useState, useEffect } from 'react';
import {
  Search, Bell, HelpCircle, Settings, ChevronDown, ChevronRight,
  Share2, Download, MoreHorizontal, LayoutList, Plus, AlertCircle, ArrowUp, ArrowDown, CheckSquare
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
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
  Story: <BookmarkIcon size={14} className="text-green-500 fill-green-100" />,
  Bug: <AlertCircle size={14} className="text-red-500 fill-red-100" />,
  Test: <TestTubeIcon size={14} className="text-purple-500 fill-purple-100" />
};

const COLUMN_COLORS = {
  'TO DO': 'bg-gray-100',
  'IN PROGRESS': 'bg-blue-50',
  'IN REVIEW': 'bg-purple-50',
  'TESTING': 'bg-orange-50',
  'DONE': 'bg-green-50',
};

function BookmarkIcon(props) {
  return <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}><path d="M5 3v18l7-4.5 7 4.5V3z" /></svg>;
}
function TestTubeIcon(props) {
  return <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}><rect x="9" y="3" width="6" height="3" rx="1" /><path d="M10 6v11a2 2 0 004 0V6" /></svg>;
}

const CheckCircleIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const AlertTriangleIcon = ({ size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
);

const INITIAL_KANBAN_DATA = {
  'TO DO': [
    { key: 'WR-101', title: 'Create wireframes for homepage', type: 'Task', priority: 'High', assignee: 'EJ' },
    { key: 'WR-102', title: 'Setup development environment', type: 'Task', priority: 'Medium', assignee: 'JW' },
    { key: 'WR-103', title: 'User research and analysis', type: 'Story', priority: 'Low', assignee: 'EJ' },
    { key: 'WR-104', title: 'Competitor analysis report', type: 'Task', priority: 'Low', assignee: 'OT' },
  ],
  'IN PROGRESS': [
    { key: 'WR-105', title: 'Design homepage UI', type: 'Task', priority: 'High', assignee: 'OT' },
    { key: 'WR-106', title: 'Implement authentication API', type: 'Story', priority: 'High', assignee: 'DM' },
    { key: 'WR-107', title: 'Develop responsive navigation', type: 'Task', priority: 'Medium', assignee: 'OT' },
    { key: 'WR-108', title: 'Create style guide and components', type: 'Task', priority: 'Low', assignee: 'OT' },
  ],
  'IN REVIEW': [
    { key: 'WR-109', title: 'Review homepage design', type: 'Task', priority: 'High', assignee: 'MB' },
    { key: 'WR-110', title: 'Code review - Login module', type: 'Task', priority: 'Medium', assignee: 'MB' },
    { key: 'WR-111', title: 'Review user dashboard UI', type: 'Task', priority: 'Medium', assignee: 'MB' },
    { key: 'WR-112', title: 'Review API integration', type: 'Task', priority: 'Medium', assignee: 'MB' },
  ],
  'TESTING': [
    { key: 'WR-113', title: 'Test login functionality', type: 'Test', priority: 'High', assignee: 'SD' },
    { key: 'WR-114', title: 'Cross-browser testing', type: 'Test', priority: 'Medium', assignee: 'AT' },
    { key: 'WR-115', title: 'Mobile responsiveness testing', type: 'Test', priority: 'Medium', assignee: 'SD' },
    { key: 'WR-116', title: 'Performance testing', type: 'Test', priority: 'Medium', assignee: 'AT' },
  ],
  'DONE': [
    { key: 'WR-117', title: 'Project kickoff meeting', type: 'Task', priority: 'Low', assignee: 'EJ' },
    { key: 'WR-118', title: 'Requirements gathering', type: 'Story', priority: 'Low', assignee: 'EJ' },
    { key: 'WR-119', title: 'Information architecture planning', type: 'Task', priority: 'Low', assignee: 'EJ' },
    { key: 'WR-120', title: 'Database schema design', type: 'Task', priority: 'Medium', assignee: 'DM' },
  ]
};

const KanbanPage = ({ department }) => {
  const { user } = useAuth();
  const [boardData, setBoardData] = useState(() => {
    const initialOrder = localStorage.getItem('kanbanColumnOrder');
    const cols = initialOrder ? JSON.parse(initialOrder) : ['TO DO', 'IN PROGRESS', 'IN REVIEW', 'TESTING', 'DONE'];
    const initialData = {};
    cols.forEach(col => {
      initialData[col] = [];
    });
    // Ensure defaults just in case
    ['TO DO', 'IN PROGRESS', 'IN REVIEW', 'TESTING', 'DONE'].forEach(col => {
      if (!initialData[col]) initialData[col] = [];
    });
    return initialData;
  });

  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('kanbanColumnOrder');
    return saved ? JSON.parse(saved) : ['TO DO', 'IN PROGRESS', 'IN REVIEW', 'TESTING', 'DONE'];
  });

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
        const tasks = await res.json();

        // Group tasks by status, ensuring all columns in columnOrder exist
        const grouped = {};
        columnOrder.forEach(col => {
          grouped[col] = [];
        });

        // Also ensure default columns exist just in case
        ['TO DO', 'IN PROGRESS', 'IN REVIEW', 'TESTING', 'DONE'].forEach(col => {
          if (!grouped[col]) grouped[col] = [];
        });

        tasks.forEach(t => {
          const status = t.status || 'TO DO';
          if (!grouped[status]) {
            grouped[status] = [];
            // If a task has a status not in columnOrder, we might need to add it to columnOrder
            // but for now just ensure it exists in boardData so it doesn't crash if added later
          }
          grouped[status].push(t);
        });

        // If there are any new statuses discovered in tasks that aren't in columnOrder, add them
        const newCols = Object.keys(grouped).filter(col => !columnOrder.includes(col));
        if (newCols.length > 0) {
          setColumnOrder(prev => [...prev, ...newCols]);
        }

        setBoardData(grouped);
      }
    } catch (err) {
      console.error('Error fetching tasks', err);
    }
  };

  useEffect(() => {
    localStorage.setItem('kanbanColumnOrder', JSON.stringify(columnOrder));
  }, [columnOrder]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);

  // Inline creation states
  const [activeCreateColumn, setActiveCreateColumn] = useState(null);
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [newIssueType, setNewIssueType] = useState('Task');
  const [newIssueAssignee, setNewIssueAssignee] = useState('Unassigned');
  const [newIssueDueDate, setNewIssueDueDate] = useState('');
  const [openInlineDropdown, setOpenInlineDropdown] = useState(null);

  // Close creation widget on clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeCreateColumn && !e.target.closest('.inline-create-box') && !e.target.closest('.create-trigger-btn')) {
        setActiveCreateColumn(null);
        setOpenInlineDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeCreateColumn]);

  const handleCreateInlineIssue = (col) => {
    if (!newIssueTitle.trim()) return;
    const newCard = {
      key: `WR-${100 + Math.floor(Math.random() * 900)}`,
      title: newIssueTitle,
      type: newIssueType,
      status: col,
      assignee: newIssueAssignee === 'Unassigned' || newIssueAssignee === 'Automatic' ? 'EJ' : newIssueAssignee.substring(0, 2).toUpperCase(),
      priority: 'Medium',
      labels: ['IT'],
      sprint: 'Sprint 1',
      due: newIssueDueDate || '28 May 2024'
    };

    setBoardData(prev => ({
      ...prev,
      [col]: [...(prev[col] || []), newCard]
    }));

    setNewIssueTitle('');
    setNewIssueType('Task');
    setNewIssueAssignee('Unassigned');
    setNewIssueDueDate('');
    setActiveCreateColumn(null);
    setOpenInlineDropdown(null);

    // Persist to database
    fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: newCard.title,
        status: newCard.status,
        priority: newCard.priority,
        due_date: newCard.due,
        assigned_to_name: newIssueAssignee,
        linked_type: 'Project',
        linked_id: '1'
      })
    }).catch(err => console.error('Failed to save inline task', err));
  };

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  let selectedIssueData = null;
  if (selectedIssue) {
    Object.values(boardData).forEach(col => {
      const found = col.find(c => c.key === selectedIssue);
      if (found) selectedIssueData = found;
    });
  }

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, type } = result;

    if (type === 'column') {
      const newColumnOrder = Array.from(columnOrder);
      const [removed] = newColumnOrder.splice(source.index, 1);
      newColumnOrder.splice(destination.index, 0, removed);
      setColumnOrder(newColumnOrder);
      return;
    }

    if (source.droppableId !== destination.droppableId) {
      const sourceItems = Array.from(boardData[source.droppableId]);
      const destItems = Array.from(boardData[destination.droppableId]);
      const [removed] = sourceItems.splice(source.index, 1);

      // Update the local status immediately for UI
      removed.status = destination.droppableId;

      destItems.splice(destination.index, 0, removed);

      setBoardData(prev => ({
        ...prev,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems
      }));

      // Persist to backend
      fetch(`http://localhost:5000/api/project-tasks/${removed.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: destination.droppableId })
      }).catch(err => console.error('Failed to update task status', err));
    } else {
      const col = [...boardData[source.droppableId]];
      const [removed] = col.splice(source.index, 1);
      col.splice(destination.index, 0, removed);
      setBoardData({
        ...boardData,
        [source.droppableId]: col
      });
    }
  };

  return (
    <>
      <ITCreateIssueDrawer isOpen={isCreateDrawerOpen} onClose={() => setIsCreateDrawerOpen(false)} />
      <div className="flex w-full h-screen bg-white overflow-hidden font-sans">
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* HEADER */}
          <div className="h-14 border-b border-gray-200 flex items-center justify-between px-6 bg-white shrink-0">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="hover:underline cursor-pointer">Projects</span>
              <ChevronRight size={14} />
              <span className="hover:underline cursor-pointer">Website Redesign</span>
              <ChevronRight size={14} />
              <span className="text-gray-900 font-medium">Kanban Board</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsCreateDrawerOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors"
              >
                <Plus size={14} /> Create
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden flex relative">
            <div className="flex-1 flex flex-col p-4 pb-0 min-w-0 bg-white">

              <div className="flex items-end justify-between mb-6">
                <div>
                  <h1 className="text-2xl  text-gray-900 mb-4">Board</h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                      <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
                      <input type="text" placeholder="Search issues" className="pl-8 pr-3 py-1.5 bg-gray-50 border-none rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-300 w-40" />
                    </div>
                    {['Project: Website Redesign', 'Type', 'Status', 'Assignee', 'Priority'].map((filter, i) => (
                      <button key={i} className={`flex items-center gap-1.5 p-2 rounded text-xs font-medium border hover:bg-gray-50 transition-colors ${i === 0 ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}>
                        {filter} <ChevronDown size={14} />
                      </button>
                    ))}
                    <button className="flex items-center gap-1 p-2 text-xs text-gray-600 hover:bg-gray-50 rounded">
                      More filters <ChevronDown size={14} />
                    </button>
                    <button className="text-xs text-blue-600 font-medium hover:underline ml-2">Save filter</button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium"><Share2 size={14} /> Share</button>
                  <button className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium"><Download size={14} /> Export</button>
                  <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16} /></button>
                </div>
              </div>

              {/* METRICS ROW */}


              {/* KANBAN BOARD */}
              <div className=" flex-1 flex flex-col min-h-0">
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="all-columns" direction="horizontal" type="column">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex gap-4 overflow-x-auto overflow-y-hidden h-full items-stretch"
                      >
                        {columnOrder.map((col, index) => (
                          <Draggable key={col} draggableId={col} index={index}>
                            {(provided) => {
                              const colBg = COLUMN_COLORS[col] || 'bg-gray-50';
                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex-1 min-w-[260px] ${colBg} rounded p-2 flex flex-col `}
                                >
                                  <div
                                    {...provided.dragHandleProps}
                                    className="flex items-center gap-2 pb-3 pt-1 px-1 shrink-0 cursor-grab active:cursor-grabbing sticky top-0 bg-inherit z-10"
                                  >
                                    <span className="text-xs  text-gray-500 ">{col}</span>
                                    <span className="text-xs text-gray-400 font-medium">{boardData[col] ? boardData[col].length : 0}</span>
                                  </div>

                                  <Droppable droppableId={col} type="task">
                                    {(provided, snapshot) => (
                                      <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 overflow-y-auto min-h-0 flex flex-col gap-2 pb-2 transition-colors rounded custom-scrollbar ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
                                      >
                                        {(boardData[col] || []).map((card, idx) => (
                                          <Draggable key={card.key} draggableId={card.key} index={idx}>
                                            {(provided, snapshot) => (
                                              <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                onClick={() => setSelectedIssue(card.key)}
                                                style={{
                                                  ...provided.draggableProps.style,
                                                }}
                                                className={`bg-white border rounded p-3  hover:shadow-md transition-shadow ${selectedIssue === card.key ? 'ring-2 ring-blue-500 border-transparent' : 'border-gray-200'} ${snapshot.isDragging ? 'shadow-lg rotate-2' : ''}`}
                                              >
                                                <div className="text-blue-600 text-xs hover:underline mb-1 font-medium cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedIssue(card.key); }}>{card.key}</div>
                                                <div className="text-xs text-gray-900 font-medium mb-4 leading-snug cursor-grab active:cursor-grabbing">{card.title}</div>

                                                <div className="flex items-center justify-between">
                                                  <div className="flex items-center gap-2">
                                                    {TYPE_ICONS[card.type] || TYPE_ICONS.Task}
                                                    {PRIORITY_ICONS[card.priority]}
                                                    <span className="text-xs text-gray-600">{card.priority}</span>
                                                  </div>
                                                  {col === 'DONE' ? (
                                                    <CheckCircleIcon className="text-green-500" size={16} />
                                                  ) : (
                                                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] ">
                                                      {card.assignee}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                          </Draggable>
                                        ))}
                                        {provided.placeholder}
                                      </div>
                                    )}
                                  </Droppable>

                                  {activeCreateColumn === col ? (
                                    <div className="mt-2 p-3 bg-white border border-blue-500 rounded  flex flex-col gap-3 font-sans text-xs inline-create-box">
                                      {/* Text Area */}
                                      <textarea
                                        autoFocus
                                        placeholder="What needs to be done?"
                                        value={newIssueTitle}
                                        onChange={(e) => setNewIssueTitle(e.target.value)}
                                        className="w-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none resize-none h-14"
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleCreateInlineIssue(col);
                                          }
                                        }}
                                      />

                                      {/* Bottom Row */}
                                      <div className="flex items-center justify-between mt-1 relative">
                                        <div className="flex items-center gap-2">
                                          {/* Work Type selector dropdown */}
                                          <div className="relative inline-dropdown">
                                            <button
                                              onClick={() => setOpenInlineDropdown(openInlineDropdown === 'type' ? null : 'type')}
                                              className="flex items-center gap-1 p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition"
                                            >
                                              {newIssueType === 'Task' && <CheckSquare size={14} className="text-blue-500 fill-blue-100" />}
                                              {newIssueType === 'Story' && <BookmarkIcon size={14} className="text-green-500 fill-green-100" />}
                                              {newIssueType === 'Bug' && <AlertCircle size={14} className="text-red-500 fill-red-100" />}
                                              {newIssueType === 'Test' && <TestTubeIcon size={14} className="text-purple-500 fill-purple-100" />}
                                              <ChevronDown size={10} />
                                            </button>
                                            {openInlineDropdown === 'type' && (
                                              <div className="absolute left-0 bottom-full mb-1.5 w-36 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 text-sm">
                                                {[
                                                  { type: 'Story', icon: <BookmarkIcon size={12} className="text-green-500 fill-green-100" /> },
                                                  { type: 'Feature', icon: <svg viewBox="0 0 24 24" className="w-3 h-3 text-green-600 fill-green-100" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8" cy="8" r="1.5" /><circle cx="16" cy="8" r="1.5" /><circle cx="8" cy="16" r="1.5" /><circle cx="16" cy="16" r="1.5" /></svg> },
                                                  { type: 'Bug', icon: <AlertCircle size={12} className="text-red-500 fill-red-100" /> },
                                                  { type: 'Task', icon: <CheckSquare size={12} className="text-blue-500 fill-blue-100" /> }
                                                ].map(item => (
                                                  <div
                                                    key={item.type}
                                                    onClick={() => {
                                                      setNewIssueType(item.type === 'Feature' ? 'Task' : item.type);
                                                      setOpenInlineDropdown(null);
                                                    }}
                                                    className="px-2.5 py-1.5 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-700 font-medium"
                                                  >
                                                    {item.icon} {item.type}
                                                  </div>
                                                ))}
                                                <div className="border-t border-gray-100 my-1"></div>
                                                <div className="px-2.5 py-1.5 hover:bg-gray-50 cursor-pointer text-gray-500 font-medium">Add work type</div>
                                                <div className="px-2.5 py-1.5 hover:bg-gray-50 cursor-pointer text-gray-500 font-medium">Edit work type</div>
                                                <div className="px-2.5 py-1.5 hover:bg-gray-50 cursor-pointer text-gray-500 font-medium">Manage</div>
                                              </div>
                                            )}
                                          </div>

                                          {/* Due date picker dropdown */}
                                          <div className="relative inline-dropdown">
                                            <button
                                              onClick={() => setOpenInlineDropdown(openInlineDropdown === 'date' ? null : 'date')}
                                              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition"
                                            >
                                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                            </button>
                                            {openInlineDropdown === 'date' && (
                                              <div className="absolute left-0 bottom-full mb-1.5 w-64 bg-white border border-gray-200 rounded shadow-xl p-3 z-50 text-gray-800">
                                                <div className="font-semibold text-xs text-gray-500 mb-1">Due date</div>
                                                <input
                                                  type="text"
                                                  placeholder="7/13/2026"
                                                  value={newIssueDueDate || '7/13/2026'}
                                                  onChange={(e) => setNewIssueDueDate(e.target.value)}
                                                  className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:border-blue-500"
                                                />
                                                {/* Calendar Grid */}
                                                <div className="mt-3">
                                                  <div className="flex justify-between items-center text-xs font-semibold text-gray-700 px-1 mb-2">
                                                    <span>July 2026</span>
                                                    <div className="flex gap-2">
                                                      <span className="cursor-pointer hover:text-blue-500">{"<"}</span>
                                                      <span className="cursor-pointer hover:text-blue-500">{">"}</span>
                                                    </div>
                                                  </div>
                                                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400 mb-1">
                                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d}>{d}</span>)}
                                                  </div>
                                                  <div className="grid grid-cols-7 gap-1 text-xs">
                                                    {[28, 29, 30, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 1].map((day, idx) => {
                                                      const isCurrentMonth = idx >= 3 && idx <= 33;
                                                      const isToday = day === 13 && isCurrentMonth;
                                                      return (
                                                        <span
                                                          key={idx}
                                                          onClick={() => {
                                                            setNewIssueDueDate(`7/${day}/2026`);
                                                            setOpenInlineDropdown(null);
                                                          }}
                                                          className={`py-1 rounded cursor-pointer transition ${isToday ? 'bg-blue-600 text-white ' :
                                                            isCurrentMonth ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300'
                                                            }`}
                                                        >
                                                          {day}
                                                        </span>
                                                      );
                                                    })}
                                                  </div>
                                                </div>
                                              </div>
                                            )}
                                          </div>

                                          {/* Assignee selector dropdown */}
                                          <div className="relative inline-dropdown">
                                            <button
                                              onClick={() => setOpenInlineDropdown(openInlineDropdown === 'assignee' ? null : 'assignee')}
                                              className="p-1 hover:bg-gray-100 rounded text-gray-500 hover:text-gray-700 transition"
                                            >
                                              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                            </button>
                                            {openInlineDropdown === 'assignee' && (
                                              <div className="absolute left-0 bottom-full mb-1.5 w-60 bg-white border border-gray-200 rounded-md shadow-lg py-1.5 z-50 text-sm">
                                                <div className="px-2 pb-1.5 border-b border-gray-100">
                                                  <input
                                                    type="text"
                                                    placeholder="Search users..."
                                                    defaultValue="Unassigned"
                                                    className="w-full px-2 py-1 border border-gray-200 rounded outline-none focus:border-blue-500"
                                                  />
                                                </div>
                                                <div className="max-h-48 overflow-y-auto mt-1">
                                                  {[
                                                    { name: 'Automatic', sub: '' },
                                                    { name: 'codigix infotech (Assign to me)', sub: 'codigixinfotech@gmail.com' },
                                                    { name: 'sonalicodigix', sub: '' },
                                                    { name: 'sanika mote', sub: '' },
                                                    { name: 'Dinesh Dhage', sub: '' },
                                                    { name: 'Abhijit Khedekar', sub: '' },
                                                    { name: 'wpdevelopercodigix', sub: '' }
                                                  ].map(user => (
                                                    <div
                                                      key={user.name}
                                                      onClick={() => {
                                                        setNewIssueAssignee(user.name);
                                                        setOpenInlineDropdown(null);
                                                      }}
                                                      className="p-2 hover:bg-gray-50 cursor-pointer text-gray-700 font-medium"
                                                    >
                                                      <div className="flex items-center gap-2">
                                                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] ">
                                                          {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                          <div>{user.name}</div>
                                                          {user.sub && <div className="text-[9px] text-gray-400 font-normal">{user.sub}</div>}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            )}
                                          </div>
                                        </div>

                                        {/* Submit Arrow Button */}
                                        <button
                                          onClick={() => handleCreateInlineIssue(col)}
                                          disabled={!newIssueTitle.trim()}
                                          className={`p-1.5 rounded transition ${newIssueTitle.trim() ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setActiveCreateColumn(col)}
                                      className="mt-2 shrink-0 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-200 p-2 rounded transition-colors w-full create-trigger-btn"
                                    >
                                      <Plus size={14} /> Create issue
                                    </button>
                                  )}
                                </div>
                              )
                            }}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {/* ADD NEW COLUMN BUTTON */}
                        <div className="min-w-[260px] h-min rounded p-3 bg-gray-50/50 hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors flex flex-col">
                          {isAddingColumn ? (
                            <div className="flex flex-col gap-2">
                              <input
                                autoFocus
                                type="text"
                                placeholder="Enter column name..."
                                className="w-full p-2 text-xs border border-gray-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={newColumnName}
                                onChange={(e) => setNewColumnName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newColumnName.trim()) {
                                    const colName = newColumnName.toUpperCase();
                                    if (!columnOrder.includes(colName)) {
                                      setColumnOrder([...columnOrder, colName]);
                                      setBoardData({ ...boardData, [colName]: [] });
                                    }
                                    setNewColumnName('');
                                    setIsAddingColumn(false);
                                  } else if (e.key === 'Escape') {
                                    setIsAddingColumn(false);
                                    setNewColumnName('');
                                  }
                                }}
                                onBlur={() => {
                                  if (newColumnName.trim()) {
                                    const colName = newColumnName.toUpperCase();
                                    if (!columnOrder.includes(colName)) {
                                      setColumnOrder([...columnOrder, colName]);
                                      setBoardData({ ...boardData, [colName]: [] });
                                    }
                                  }
                                  setNewColumnName('');
                                  setIsAddingColumn(false);
                                }}
                              />
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsAddingColumn(true)}
                              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 w-full"
                            >
                              <Plus size={14} /> Add column
                            </button>
                          )}
                        </div>

                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

            </div>

            {/* RIGHT SIDE PANEL (ISSUE DETAILS) */}
            <ITIssueDetailsPanel
              issue={selectedIssueData}
              onClose={() => setSelectedIssue(null)}
            />

          </div>
        </div>
      </div>
    </>
  );
};

export default KanbanPage;
