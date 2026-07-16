import React, { useState, useEffect, useRef } from 'react';
import {
  Lock, Eye, ThumbsUp, Share2, MoreHorizontal, X, Paperclip,
  CheckSquare, Link as LinkIcon, ChevronDown, ChevronRight, ArrowUp, ArrowDown,
  Plus, Check, Github, GitPullRequest, GitCommit, MessageSquare, History,
  Clock, Sparkles, Trash2, Settings, Calendar, User, Edit3, CornerDownRight
} from 'lucide-react';

const PRIORITY_ICONS = {
  High: <ArrowUp size={14} className="text-red-500 font-bold" />,
  Medium: <ArrowUp size={14} className="text-orange-500" />,
  Low: <ArrowDown size={14} className="text-blue-500" />
};

const TYPE_ICONS = {
  Task: <CheckSquare size={14} className="text-blue-500 fill-blue-100" />,
  Story: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-green-500 fill-green-100" fill="currentColor"><path d="M5 3v18l7-4.5 7 4.5V3z" /></svg>,
  Bug: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-red-500 fill-red-100" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8" cy="8" r="1.5" /><circle cx="16" cy="8" r="1.5" /><circle cx="8" cy="16" r="1.5" /><circle cx="16" cy="16" r="1.5" /></svg>,
  Test: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-purple-500 fill-purple-100" fill="currentColor"><rect x="9" y="3" width="6" height="3" rx="1" /><path d="M10 6v11a2 2 0 004 0V6" /></svg>
};

const USERS = [
  { name: 'Emma Johnson', initial: 'EJ', color: 'bg-purple-100 text-purple-700' },
  { name: 'Olivia Taylor', initial: 'OT', color: 'bg-blue-100 text-blue-700' },
  { name: 'James Wilson', initial: 'JW', color: 'bg-green-100 text-green-700' },
  { name: 'Daniel Martinez', initial: 'DM', color: 'bg-orange-100 text-orange-700' },
  { name: 'Sophia Davis', initial: 'SD', color: 'bg-pink-100 text-pink-700' },
  { name: 'Abhijit Khedekar', initial: 'AK', color: 'bg-indigo-100 text-indigo-700' },
  { name: 'codigix infotech', initial: 'CI', color: 'bg-teal-100 text-teal-700' }
];

const SPRINTS = ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Backlog'];

const ITIssueDetailsPanel = ({ issue, onClose }) => {
  // Core sync states
  const [title, setTitle] = useState('');
  const [currentStatus, setCurrentStatus] = useState('TO DO');
  const [assignee, setAssignee] = useState(USERS[0]);
  const [reporter, setReporter] = useState(USERS[6]); // default to codigix infotech
  const [priority, setPriority] = useState('Medium');
  const [type, setType] = useState('Task');
  const [labels, setLabels] = useState([]);
  const [sprint, setSprint] = useState('Sprint 1');
  const [dueDate, setDueDate] = useState('None');
  const [startDate, setStartDate] = useState('None');
  const [team, setTeam] = useState('None');
  const [parent, setParent] = useState('None');

  // Descriptions, Subtasks, Links, Comments
  const [description, setDescription] = useState('Add a description...');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState('');

  const [subtasks, setSubtasks] = useState([
    { id: 1, title: 'Define key user flows', completed: true },
    { id: 2, title: 'Draft layouts for mobile views', completed: false }
  ]);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [linkedIssues, setLinkedIssues] = useState([
    { relation: 'is blocked by', key: 'WR-102', title: 'Setup development environment' }
  ]);
  const [isLinkingIssue, setIsLinkingIssue] = useState(false);
  const [linkRelation, setLinkRelation] = useState('is blocked by');
  const [linkSearchInput, setLinkSearchInput] = useState('');

  const [comments, setComments] = useState([
    { id: 1, author: 'Olivia Taylor', initial: 'OT', color: 'bg-blue-100 text-blue-700', text: 'Wireframes are looking good! Just need to check the footer.', date: '3 hours ago' }
  ]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  // Layout UI states
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isWatching, setIsWatching] = useState(true);
  const [watchCount, setWatchCount] = useState(1);
  const [activeTab, setActiveTab] = useState('Comments'); // 'All', 'Comments', 'History', 'Work log'
  const [collapsedSections, setCollapsedSections] = useState({
    details: false,
    development: false,
    automation: false
  });

  const fileInputRef = useRef(null);
  const commentInputRef = useRef(null);

  // Sync with prop when issue changes
  useEffect(() => {
    if (issue) {
      setTitle(issue.title || '');
      setCurrentStatus(issue.status || 'TO DO');
      setPriority(issue.priority || 'Medium');
      setType(issue.type || 'Task');
      setSprint(issue.sprint || 'Sprint 1');
      setDueDate(issue.due || 'None');
      setLabels(issue.labels || []);
      setDescription(issue.description || 'Add a description...');
      setTempDescription(issue.description || 'Add a description...');

      if (issue.subtasks) setSubtasks(issue.subtasks);
      if (issue.linkedIssues) setLinkedIssues(issue.linkedIssues);
      if (issue.comments) setComments(issue.comments);

      // Match assignee
      const foundAssignee = USERS.find(u => u.name === issue.assignee || u.initial === issue.assignee);
      if (foundAssignee) {
        setAssignee(foundAssignee);
      } else if (issue.assignee) {
        setAssignee({ name: issue.assignee, initial: issue.assignee.substring(0, 2).toUpperCase(), color: 'bg-blue-100 text-blue-700' });
      } else {
        setAssignee({ name: 'Unassigned', initial: 'U', color: 'bg-gray-100 text-gray-500' });
      }

      // Default parent etc.
      setParent('None');
      setStartDate('None');
      setTeam('None');
    }
  }, [issue]);

  // Handle outside clicks for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openDropdown && !e.target.closest('.interactive-dropdown')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  if (!issue) return null;

  const STATUS_COLORS = {
    'TO DO': 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200',
    'IN PROGRESS': 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    'IN REVIEW': 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    'TESTING': 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
    'DONE': 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleWatchToggle = () => {
    if (isWatching) {
      setIsWatching(false);
      setWatchCount(prev => Math.max(0, prev - 1));
    } else {
      setIsWatching(true);
      setWatchCount(prev => prev + 1);
    }
  };

  const handleAssignToMe = () => {
    // default to EJ (Emma Johnson) as current user
    setAssignee(USERS[0]);
  };

  const handleImproveDescription = () => {
    setDescription(prev => prev + "\n\n**Expanded Requirements:**\n- Ensure design respects standard responsive breakpoints.\n- Follow high contrast guidelines for color schemes.\n- Validate loading states & interactive micro-animations.");
    setTempDescription(prev => prev + "\n\n**Expanded Requirements:**\n- Ensure design respects standard responsive breakpoints.\n- Follow high contrast guidelines for color schemes.\n- Validate loading states & interactive micro-animations.");
  };

  const handleSaveDescription = () => {
    setDescription(tempDescription);
    setIsEditingDescription(false);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks(prev => [
      ...prev,
      { id: Date.now(), title: newSubtaskTitle, completed: false }
    ]);
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
  };

  const toggleSubtask = (id) => {
    setSubtasks(prev => prev.map(st => st.id === id ? { ...st, completed: !st.completed } : st));
  };

  const deleteSubtask = (id) => {
    setSubtasks(prev => prev.filter(st => st.id !== id));
  };

  const handleCreateLinkedIssue = () => {
    if (!linkSearchInput.trim()) return;
    setLinkedIssues(prev => [
      ...prev,
      { relation: linkRelation, key: `WR-${Math.floor(Math.random() * 900) + 100}`, title: linkSearchInput }
    ]);
    setLinkSearchInput('');
    setIsLinkingIssue(false);
  };

  const deleteLinkedIssue = (key) => {
    setLinkedIssues(prev => prev.filter(li => li.key !== key));
  };

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    setComments(prev => [
      ...prev,
      {
        id: Date.now(),
        author: 'codigix infotech',
        initial: 'CI',
        color: 'bg-teal-100 text-teal-700',
        text: newCommentText,
        date: 'Just now'
      }
    ]);
    setNewCommentText('');
    setIsCommenting(false);
  };

  const deleteComment = (id) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[480px] border-l border-gray-200 bg-white flex flex-col flex-shrink-0 shadow-2xl z-20 animate-slide-left font-sans text-gray-800">
      
      {/* HEADER SECTION */}
      <div className="h-14 border-b border-gray-200 px-5 flex items-center justify-between bg-white shrink-0">
        
        {/* Breadcrumb Info */}
        <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
          <button className="flex items-center gap-1 py-1 px-1.5 hover:bg-gray-100 rounded text-gray-600 font-semibold transition">
            <Edit3 size={12} className="text-gray-400" />
            <span>Add epic</span>
          </button>
          <span className="text-gray-300">/</span>
          <div className="flex items-center gap-1 py-1 px-1.5 text-blue-600 font-semibold hover:underline cursor-pointer">
            {TYPE_ICONS[type] || TYPE_ICONS.Task}
            <span>{issue.key}</span>
          </div>
        </div>

        {/* Action icons on right */}
        <div className="flex items-center gap-1">
          {/* Watcher button */}
          <button 
            onClick={handleWatchToggle}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded border transition ${
              isWatching 
                ? 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100' 
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Eye size={13} />
            <span>{watchCount}</span>
          </button>

          {/* Share */}
          <button className="p-1.5 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 transition" title="Share">
            <Share2 size={13} />
          </button>

          {/* More actions dropdown */}
          <div className="interactive-dropdown relative">
            <button 
              onClick={() => toggleDropdown('header-more')}
              className="p-1.5 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 transition"
            >
              <MoreHorizontal size={13} />
            </button>
            {openDropdown === 'header-more' && (
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 text-xs">
                <div className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-700">
                  <Lock size={12} /> Restrict access
                </div>
                <div className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-700">
                  <Paperclip size={12} /> Attach file
                </div>
                <hr className="my-1 border-gray-100" />
                <div className="px-3 py-2 hover:bg-red-50 text-red-600 cursor-pointer">
                  Delete issue
                </div>
              </div>
            )}
          </div>

          {/* Close Sidebar */}
          <button onClick={onClose} className="p-1.5 rounded text-gray-500 hover:bg-gray-100 transition ml-1">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* SCROLLABLE PANEL CONTENT */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar pb-24">
        
        {/* Title */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 leading-snug break-words">
            {title}
          </h2>
        </div>

        {/* Mini Actions Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Add attachment/item shortcut */}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition shadow-sm"
            title="Attach file"
          >
            <Plus size={14} />
          </button>
          <input type="file" ref={fileInputRef} className="hidden" />

          {/* Subtasks shortcut */}
          <button 
            onClick={() => {
              setIsAddingSubtask(true);
              setTimeout(() => document.getElementById('subtask-input')?.focus(), 50);
            }}
            className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition shadow-sm"
            title="Add subtask"
          >
            <CheckSquare size={13} />
          </button>

          {/* Link issue shortcut */}
          <button 
            onClick={() => setIsLinkingIssue(true)}
            className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition shadow-sm"
            title="Link work item"
          >
            <LinkIcon size={12} />
          </button>

          {/* Status Dropdown */}
          <div className="interactive-dropdown relative">
            <button 
              onClick={() => toggleDropdown('status-select')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs uppercase tracking-wider rounded border font-semibold transition ${STATUS_COLORS[currentStatus] || STATUS_COLORS['TO DO']}`}
            >
              <span>{currentStatus}</span>
              <ChevronDown size={12} />
            </button>
            {openDropdown === 'status-select' && (
              <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 text-xs">
                {Object.keys(STATUS_COLORS).map(status => (
                  <div
                    key={status}
                    onClick={() => { setCurrentStatus(status); setOpenDropdown(null); }}
                    className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between font-medium text-gray-700"
                  >
                    <span>{status}</span>
                    {currentStatus === status && <Check size={13} className="text-blue-600" />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lightning bolt action */}
          <button className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition shadow-sm">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M11 21h-1l1-7H5.5L13 3h1l-1 7h5.5z" /></svg>
          </button>

          {/* Improve Task (AI Star Assist) */}
          <button 
            onClick={handleImproveDescription}
            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 text-blue-700 rounded transition"
          >
            <Sparkles size={11} className="text-blue-500 fill-blue-100 animate-pulse" />
            <span>Improve Task</span>
          </button>
        </div>

        {/* DESCRIPTION SECTION */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 tracking-wide block">Description</label>
          {isEditingDescription ? (
            <div className="space-y-2">
              <textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                className="w-full text-xs p-2.5 border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans leading-relaxed h-28"
              />
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={handleSaveDescription} 
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition"
                >
                  Save
                </button>
                <button 
                  onClick={() => { setTempDescription(description); setIsEditingDescription(false); }} 
                  className="px-3 py-1 hover:bg-gray-100 border border-gray-300 rounded text-xs font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => { setTempDescription(description); setIsEditingDescription(true); }}
              className="text-xs text-gray-700 leading-relaxed hover:bg-gray-50 border border-transparent hover:border-gray-200 p-2.5 -ml-2.5 rounded cursor-pointer transition min-h-[36px]"
            >
              {description === 'Add a description...' ? (
                <span className="text-gray-400">{description}</span>
              ) : (
                <div className="whitespace-pre-line">{description}</div>
              )}
            </div>
          )}
        </div>

        {/* SUBTASKS SECTION */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 tracking-wide block">Subtasks</label>
          
          <div className="space-y-1.5">
            {subtasks.map(st => (
              <div key={st.id} className="flex items-center justify-between group hover:bg-gray-50 p-1 px-1.5 rounded transition text-xs">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="checkbox"
                    checked={st.completed}
                    onChange={() => toggleSubtask(st.id)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`font-medium ${st.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                    {st.title}
                  </span>
                </div>
                <button 
                  onClick={() => deleteSubtask(st.id)} 
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1 rounded transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {isAddingSubtask ? (
            <div className="flex items-center gap-2">
              <input
                id="subtask-input"
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                className="flex-1 text-xs border border-gray-300 rounded px-2.5 py-1.5 outline-none focus:border-blue-500"
              />
              <button 
                onClick={handleAddSubtask} 
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition"
              >
                Add
              </button>
              <button 
                onClick={() => setIsAddingSubtask(false)} 
                className="p-1.5 hover:bg-gray-100 border border-gray-300 rounded text-gray-500 transition"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => {
                setIsAddingSubtask(true);
                setTimeout(() => document.getElementById('subtask-input')?.focus(), 50);
              }}
              className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:bg-blue-50 p-1.5 -ml-1.5 rounded transition"
            >
              <Plus size={13} />
              <span>Add subtask</span>
            </button>
          )}
        </div>

        {/* LINKED WORK ITEMS */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-gray-500 tracking-wide block">Linked work items</label>

          <div className="space-y-2">
            {linkedIssues.map(li => (
              <div key={li.key} className="flex items-center justify-between text-xs border border-gray-100 p-2 rounded bg-gray-50/50 hover:bg-gray-50 group transition">
                <div className="flex items-center gap-2">
                  <CornerDownRight size={13} className="text-gray-400" />
                  <span className="font-semibold text-gray-500 uppercase">{li.relation}</span>
                  <a href={`#${li.key}`} className="font-semibold text-blue-600 hover:underline">{li.key}</a>
                  <span className="text-gray-700 font-medium truncate max-w-[200px]">{li.title}</span>
                </div>
                <button 
                  onClick={() => deleteLinkedIssue(li.key)} 
                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1 rounded transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>

          {isLinkingIssue ? (
            <div className="bg-gray-50 border border-gray-200 rounded p-3 space-y-3">
              <div className="flex gap-2">
                <div className="interactive-dropdown relative flex-1">
                  <select 
                    value={linkRelation}
                    onChange={(e) => setLinkRelation(e.target.value)}
                    className="w-full text-xs bg-white border border-gray-300 rounded px-2 py-1.5 outline-none"
                  >
                    <option value="is blocked by">is blocked by</option>
                    <option value="blocks">blocks</option>
                    <option value="relates to">relates to</option>
                    <option value="is duplicated by">is duplicated by</option>
                  </select>
                </div>
              </div>
              <input
                type="text"
                value={linkSearchInput}
                onChange={(e) => setLinkSearchInput(e.target.value)}
                placeholder="Type, search or paste URL (e.g. WR-102)"
                className="w-full text-xs bg-white border border-gray-300 rounded px-2.5 py-1.5 outline-none focus:border-blue-500"
              />
              <div className="flex gap-2 justify-end">
                <button 
                  onClick={handleCreateLinkedIssue} 
                  disabled={!linkSearchInput.trim()}
                  className={`px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition ${!linkSearchInput.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Link
                </button>
                <button 
                  onClick={() => setIsLinkingIssue(false)} 
                  className="px-3 py-1 border border-gray-300 hover:bg-gray-100 rounded text-xs font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsLinkingIssue(true)}
              className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:bg-blue-50 p-1.5 -ml-1.5 rounded transition"
            >
              <Plus size={13} />
              <span>Link work item</span>
            </button>
          )}
        </div>

        {/* COLLAPSIBLE DETAILS */}
        <div className="border border-gray-200 rounded overflow-hidden">
          
          {/* Details Accordion Header */}
          <div 
            onClick={() => toggleSection('details')}
            className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-1.5">
              {collapsedSections.details ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Details</span>
            </div>
            <Settings size={14} className="text-gray-400 hover:text-gray-600" />
          </div>

          {/* Details Content */}
          {!collapsedSections.details && (
            <div className="p-3.5 space-y-3.5 text-xs bg-white">
              
              {/* Assignee */}
              <div className="grid grid-cols-3 items-center min-h-[30px]">
                <span className="text-gray-500 font-medium">Assignee</span>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="interactive-dropdown relative flex-1">
                    <div 
                      onClick={() => toggleDropdown('details-assignee')}
                      className="flex items-center gap-2 hover:bg-gray-50 p-1 -ml-1 rounded cursor-pointer transition text-gray-800 font-semibold w-fit"
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${assignee.color}`}>{assignee.initial}</div>
                      <span>{assignee.name}</span>
                      <ChevronDown size={12} className="text-gray-400" />
                    </div>
                    {openDropdown === 'details-assignee' && (
                      <div className="absolute left-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 max-h-52 overflow-y-auto">
                        {USERS.map(u => (
                          <div 
                            key={u.name} 
                            onClick={() => { setAssignee(u); setOpenDropdown(null); }}
                            className="px-3 py-1.5 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-xs"
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${u.color}`}>{u.initial}</div>
                            <span className="font-semibold text-gray-700">{u.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleAssignToMe}
                    className="text-blue-600 hover:underline font-semibold ml-2"
                  >
                    Assign to me
                  </button>
                </div>
              </div>

              {/* Parent */}
              <div className="grid grid-cols-3 items-center min-h-[30px]">
                <span className="text-gray-500 font-medium">Parent</span>
                <span className="col-span-2 text-gray-500 font-medium">{parent}</span>
              </div>

              {/* Due Date */}
              <div className="grid grid-cols-3 items-center min-h-[30px]">
                <span className="text-gray-500 font-medium">Due date</span>
                <div className="col-span-2 interactive-dropdown relative">
                  <div 
                    onClick={() => toggleDropdown('details-due')}
                    className="flex items-center gap-1.5 hover:bg-gray-50 p-1 -ml-1 rounded cursor-pointer transition text-gray-800 font-semibold w-fit"
                  >
                    <Calendar size={13} className="text-gray-400" />
                    <span>{dueDate}</span>
                  </div>
                  {openDropdown === 'details-due' && (
                    <div className="absolute left-0 top-full mt-1.5 bg-white border border-gray-200 rounded shadow-lg p-2 z-50 text-xs">
                      <input 
                        type="date" 
                        value={dueDate === 'None' ? '' : dueDate} 
                        onChange={(e) => { setDueDate(e.target.value || 'None'); setOpenDropdown(null); }}
                        className="p-1 border border-gray-300 rounded text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Labels */}
              <div className="grid grid-cols-3 items-center min-h-[30px]">
                <span className="text-gray-500 font-medium">Labels</span>
                <div className="col-span-2 flex flex-wrap gap-1 items-center">
                  {labels.length === 0 ? (
                    <span className="text-gray-400 font-medium">None</span>
                  ) : (
                    labels.map(l => (
                      <span key={l} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium text-[10px]">
                        {l}
                      </span>
                    ))
                  )}
                  <span className="text-gray-400 hover:text-gray-600 cursor-pointer text-xs ml-1 font-bold">+</span>
                </div>
              </div>

              {/* Team */}
              <div className="grid grid-cols-3 items-center min-h-[30px]">
                <span className="text-gray-500 font-medium">Team</span>
                <span className="col-span-2 text-gray-500 font-medium">{team}</span>
              </div>

              {/* Start Date */}
              <div className="grid grid-cols-3 items-center min-h-[30px]">
                <span className="text-gray-500 font-medium">Start date</span>
                <span className="col-span-2 text-gray-500 font-medium">{startDate}</span>
              </div>

              {/* Reporter */}
              <div className="grid grid-cols-3 items-center min-h-[30px]">
                <span className="text-gray-500 font-medium">Reporter</span>
                <div className="col-span-2 flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${reporter.color}`}>{reporter.initial}</div>
                  <span className="font-semibold text-gray-800">{reporter.name}</span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* COLLAPSIBLE DEVELOPMENT */}
        <div className="border border-gray-200 rounded overflow-hidden">
          
          <div 
            onClick={() => toggleSection('development')}
            className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
          >
            {collapsedSections.development ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Development</span>
          </div>

          {!collapsedSections.development && (
            <div className="p-3.5 space-y-2.5 text-xs bg-white">
              <button className="flex items-center gap-2 text-blue-600 hover:underline font-semibold p-1 -ml-1 rounded transition w-full text-left">
                <Github size={13} className="text-gray-600" />
                <span>Connect development tools</span>
              </button>
              <button className="flex items-center gap-2 text-blue-600 hover:underline font-semibold p-1 -ml-1 rounded transition w-full text-left">
                <LinkIcon size={13} className="text-gray-600" />
                <span>Open in coding tool</span>
              </button>
              
              <div className="border-t border-gray-100 my-2 pt-2 space-y-2">
                <div className="flex justify-between items-center text-gray-600">
                  <div className="flex items-center gap-1.5 font-semibold text-blue-600 hover:underline cursor-pointer">
                    <GitPullRequest size={13} />
                    <span>Create branch</span>
                  </div>
                  <ChevronRight size={12} className="text-gray-400" />
                </div>
                
                <div className="flex justify-between items-center text-gray-600">
                  <div className="flex items-center gap-1.5 font-semibold text-blue-600 hover:underline cursor-pointer">
                    <GitCommit size={13} />
                    <span>Create commit</span>
                  </div>
                  <ChevronRight size={12} className="text-gray-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLLAPSIBLE AUTOMATION */}
        <div className="border border-gray-200 rounded overflow-hidden">
          
          <div 
            onClick={() => toggleSection('automation')}
            className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-1.5">
              {collapsedSections.automation ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Automation</span>
            </div>
            <Settings size={14} className="text-gray-400 hover:text-gray-600" />
          </div>

          {!collapsedSections.automation && (
            <div className="p-3.5 space-y-3 bg-white text-xs">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700">Recent rule runs</span>
                <button className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-800 transition">
                  <Clock size={11} />
                  <span>Refresh</span>
                </button>
              </div>
              
              <div className="p-2 border border-dashed border-gray-200 rounded text-center text-gray-400">
                Refresh to see recent runs.
              </div>

              <div className="flex justify-between items-center pt-2">
                <button className="text-blue-600 hover:underline font-semibold">
                  Create new automation rule
                </button>
                <div className="flex flex-col text-[10px] text-gray-400 text-right">
                  <span>Created 6 hours ago</span>
                  <span>Updated 6 hours ago</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ACTIVITY SECTION */}
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <h3 className="text-sm font-semibold text-gray-900">Activity</h3>

          {/* Activity tabs */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-1">
            <div className="flex gap-4 text-xs font-semibold">
              {['All', 'Comments', 'History', 'Work log'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 transition relative ${
                    activeTab === tab 
                      ? 'text-blue-600 border-b-2 border-blue-600 -mb-[9px]' 
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <button className="text-[10px] text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1">
              <span>Newest first</span>
              <ChevronDown size={11} />
            </button>
          </div>

          {/* Comments content */}
          {activeTab === 'Comments' && (
            <div className="space-y-4">
              
              {/* Comment add box */}
              <div className="flex gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-teal-100 text-teal-700`}>CI</div>
                <div className="flex-1 space-y-2">
                  {isCommenting ? (
                    <div className="border border-blue-500 rounded p-2 bg-white space-y-2">
                      <textarea
                        ref={commentInputRef}
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full text-xs outline-none resize-none h-16 font-sans leading-relaxed text-gray-800"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            handleAddComment();
                          }
                        }}
                      />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-normal">
                          Pro tip: press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-[9px] font-mono">Ctrl + Enter</kbd> to save
                        </span>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleAddComment} 
                            disabled={!newCommentText.trim()}
                            className={`px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition ${!newCommentText.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => { setNewCommentText(''); setIsCommenting(false); }} 
                            className="px-3 py-1 border border-gray-300 hover:bg-gray-100 rounded text-xs font-medium transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => {
                        setIsCommenting(true);
                        setTimeout(() => commentInputRef.current?.focus(), 50);
                      }}
                      className="border border-gray-200 hover:border-gray-300 rounded p-2 text-xs text-gray-400 cursor-text transition"
                    >
                      Add a comment...
                    </div>
                  )}
                  <span className="text-[10px] text-gray-400 block px-1">
                    Pro tip: press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-[9px] font-mono">M</kbd> to comment
                  </span>
                </div>
              </div>

              {/* Render Comments List */}
              <div className="space-y-3.5 pt-2">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-2.5 text-xs group">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${c.color}`}>{c.initial}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">{c.author}</span>
                        <span className="text-[10px] text-gray-400">{c.date}</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed break-words font-medium">{c.text}</p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <button className="hover:text-gray-700 font-semibold">Edit</button>
                        <span>•</span>
                        <button 
                          onClick={() => deleteComment(c.id)}
                          className="hover:text-red-500 font-semibold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {activeTab !== 'Comments' && (
            <p className="text-xs text-gray-400 text-center py-4">No activity to show in {activeTab}.</p>
          )}

        </div>

      </div>

      <style>{`
        .animate-slide-left { animation: slideLeft 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default ITIssueDetailsPanel;