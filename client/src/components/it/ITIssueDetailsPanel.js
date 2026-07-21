import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import {
  Lock, Eye, ThumbsUp, Share2, MoreHorizontal, X, Paperclip,
  CheckSquare, Link as LinkIcon, ChevronDown, ChevronRight, ArrowUp, ArrowDown,
  Plus, Check, Github, GitPullRequest, GitCommit, MessageSquare, History,
  Clock, Sparkles, Trash2, Settings, Calendar, User, Edit3, CornerDownRight,
  Search, CornerDownLeft, Info, Pin, ChevronLeft, ChevronsLeft, ChevronsRight, Repeat,
  Zap, FileEdit, FileText, AlignLeft, Network, CopyCheck, Maximize2, Minimize2
} from 'lucide-react';

const PRIORITY_ICONS = {
  High: <ArrowUp size={14} className="text-red-500 " />,
  Medium: <ArrowUp size={14} className="text-orange-500" />,
  Low: <ArrowDown size={14} className="text-blue-500" />
};

const TYPE_ICONS = {
  Task: <CheckSquare size={14} className="text-blue-500 fill-blue-100" />,
  Story: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-green-500 fill-green-100" fill="currentColor"><path d="M5 3v18l7-4.5 7 4.5V3z" /></svg>,
  Bug: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-red-500 fill-red-100" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8" cy="8" r="1.5" /><circle cx="16" cy="8" r="1.5" /><circle cx="8" cy="16" r="1.5" /><circle cx="16" cy="16" r="1.5" /></svg>,
  Test: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-purple-500 fill-purple-100" fill="currentColor"><rect x="9" y="3" width="6" height="3" rx="1" /><path d="M10 6v11a2 2 0 004 0V6" /></svg>
};

const USERS = [];

const SPRINTS = ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Backlog'];

const ITIssueDetailsPanel = ({ issue, updateIssue, deleteIssue, onClose, onIssueCreated }) => {
  // Core sync states
  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('TO DO');
  const [assignee, setAssignee] = useState({ name: 'Unassigned' });
  const [reporter, setReporter] = useState(USERS[6]); // default to codigix infotech
  const [priority, setPriority] = useState('Medium');
  const [type, setType] = useState('Task');
  const [labels, setLabels] = useState([]);
  const [sprint, setSprint] = useState('Sprint 1');
  const [dueDate, setDueDate] = useState('None');
  const [startDate, setStartDate] = useState('None');
  const [team, setTeam] = useState('None');
  const [parent, setParent] = useState('None');

  // Estimates & Time states
  const [progress, setProgress] = useState(0);
  const [originalEstimate, setOriginalEstimate] = useState('0h');
  const [remainingEstimate, setRemainingEstimate] = useState('0h');
  const [timeSpent, setTimeSpent] = useState('0h');

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
  const [isSuggesting, setIsSuggesting] = useState(false);

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
    estimates: false,
    development: false,
    automation: false
  });
  const [showDoneWorkItems, setShowDoneWorkItems] = useState(false);

  const [aiLoading, setAiLoading] = useState({
    description: false,
    confluence: false,
    comments: false,
    subtasks: false,
    similar: false
  });

  const [duplicateWarning, setDuplicateWarning] = useState([]);
  const [docsData, setDocsData] = useState(null);

  // Side by Side Description states
  const [isImprovingSideBySide, setIsImprovingSideBySide] = useState(false);
  const [improvedDescription, setImprovedDescription] = useState('');

  // Suggested subtasks state
  const [detailedSuggestedSubtasks, setDetailedSuggestedSubtasks] = useState([]);
  const [showSuggestedSubtasksCard, setShowSuggestedSubtasksCard] = useState(false);
  const [chatInputText, setChatInputText] = useState('');
  const [isRefining, setIsRefining] = useState(false);

  // Subtask AI detail drawer
  const [selectedSubtaskForAi, setSelectedSubtaskForAi] = useState(null);
  const [subtaskAiDetails, setSubtaskAiDetails] = useState(null);
  const [showSubtaskAiModal, setShowSubtaskAiModal] = useState(false);

  const fileInputRef = useRef(null);
  const commentInputRef = useRef(null);

  const handleImproveDescription = async () => {
    setOpenDropdown(null);
    setAiLoading(prev => ({ ...prev, description: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/it-kanban/issues/${issue.issue_key || issue.key}/ai/improve-description`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to generate AI description');
      const data = await res.json();
      setDescription(data.description);
      setTempDescription(data.description);
      handleUpdate({ description: data.description });

      Swal.fire({
        icon: 'success',
        title: 'AI Description Updated',
        text: 'The description has been professionally enhanced by AI!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to improve description: ' + err.message, 'error');
    } finally {
      setAiLoading(prev => ({ ...prev, description: false }));
    }
  };

  const handleLinkConfluence = async () => {
    setOpenDropdown(null);
    setAiLoading(prev => ({ ...prev, confluence: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/it-kanban/issues/${issue.issue_key || issue.key}/ai/link-confluence`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to suggest Confluence links');
      const data = await res.json();
      setLinkedIssues(data.linked_issues);
      handleUpdate({ linked_issues: data.linked_issues });

      Swal.fire({
        icon: 'success',
        title: 'Confluence Content Linked',
        text: 'AI suggested documentation links have been added successfully.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to link Confluence content: ' + err.message, 'error');
    } finally {
      setAiLoading(prev => ({ ...prev, confluence: false }));
    }
  };

  const handleSummarizeComments = async () => {
    setOpenDropdown(null);
    setAiLoading(prev => ({ ...prev, comments: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/it-kanban/issues/${issue.issue_key || issue.key}/ai/summarize-comments`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to summarize comments');
      const data = await res.json();

      Swal.fire({
        title: 'AI Comment Summary',
        html: `<div class="text-left text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 border border-gray-200 rounded max-h-60 overflow-y-auto">${data.summary}</div>`,
        confirmButtonText: 'Great'
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to summarize comments: ' + err.message, 'error');
    } finally {
      setAiLoading(prev => ({ ...prev, comments: false }));
    }
  };

  const handleSuggestSubtasks = async () => {
    setOpenDropdown(null);
    setAiLoading(prev => ({ ...prev, subtasks: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/it-kanban/issues/${issue.issue_key || issue.key}/ai/suggest-subtasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      if (!res.ok) throw new Error('Failed to suggest subtasks');
      const data = await res.json();

      if (!data.subtasks || data.subtasks.length === 0) {
        Swal.fire('AI Suggestion', 'No subtasks could be generated for this ticket.', 'info');
        return;
      }

      // Display prompt where user can select which subtasks to add
      const subtaskHTML = data.subtasks.map((st, i) => `
        <div class="flex items-center gap-2 mb-2 text-left text-sm">
          <input type="checkbox" id="ai-subtask-${i}" class="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" checked />
          <label for="ai-subtask-${i}" class="text-gray-700">${st.title}</label>
        </div>
      `).join('');

      Swal.fire({
        title: 'AI Suggested Subtasks',
        html: `<div class="p-3 bg-gray-50 border border-gray-200 rounded max-h-60 overflow-y-auto">${subtaskHTML}</div>`,
        showCancelButton: true,
        confirmButtonText: 'Add Selected Tasks',
        cancelButtonText: 'Cancel',
        preConfirm: () => {
          const selected = [];
          data.subtasks.forEach((st, i) => {
            const checkbox = document.getElementById(`ai-subtask-${i}`);
            if (checkbox && checkbox.checked) {
              selected.push(st);
            }
          });
          return selected;
        }
      }).then((result) => {
        if (result.isConfirmed && result.value.length > 0) {
          // Add selected subtasks
          const newSubtasks = [...subtasks];
          result.value.forEach(st => {
            const maxId = newSubtasks.reduce((max, item) => item.id > max ? item.id : max, 0);
            newSubtasks.push({
              id: maxId + 1,
              title: st.title,
              completed: false
            });
          });
          setSubtasks(newSubtasks);
          handleUpdate({ subtasks: newSubtasks });

          Swal.fire({
            icon: 'success',
            title: 'Subtasks Added',
            text: `Successfully added ${result.value.length} subtasks!`,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
          });
        }
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to suggest subtasks: ' + err.message, 'error');
    } finally {
      setAiLoading(prev => ({ ...prev, subtasks: false }));
    }
  };

  const handleLinkSimilar = async () => {
    setOpenDropdown(null);
    setAiLoading(prev => ({ ...prev, similar: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/it-kanban/issues/${issue.issue_key || issue.key}/ai/link-similar`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to find similar issues');
      const data = await res.json();
      setLinkedIssues(data.linked_issues);
      handleUpdate({ linked_issues: data.linked_issues });

      Swal.fire({
        icon: 'success',
        title: 'Similar Issues Linked',
        text: 'AI has analyzed other tickets and linked similar issues successfully.',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to link similar issues: ' + err.message, 'error');
    } finally {
      setAiLoading(prev => ({ ...prev, similar: false }));
    }
  };

  const logAiAction = (actionText) => {
    const newLog = {
      id: Date.now(),
      author: 'AI Copilot',
      initial: 'AI',
      color: 'bg-purple-100 text-purple-700',
      text: `🤖 [AI Action] ${actionText}`,
      date: 'Just now'
    };
    setComments(prev => [newLog, ...prev]);
  };

  const handleSideBySideImprove = async () => {
    setOpenDropdown(null);
    setAiLoading(prev => ({ ...prev, description: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/it-kanban/issues/${issue.issue_key || issue.key}/ai/generate-improved-description`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
      });
      if (!res.ok) throw new Error('Failed to analyze description');
      const data = await res.json();
      setImprovedDescription(data.improvedDescription);
      setIsImprovingSideBySide(true);

      logAiAction('Initiated AI side-by-side description analysis.');
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setAiLoading(prev => ({ ...prev, description: false }));
    }
  };

  const handleDetailedSubtaskSuggest = async () => {
    setOpenDropdown(null);
    setAiLoading(prev => ({ ...prev, subtasks: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/it-kanban/issues/${issue.issue_key || issue.key}/ai/generate-subtasks-detailed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      if (!res.ok) throw new Error('Failed to generate detailed subtasks');
      const data = await res.json();
      setDetailedSuggestedSubtasks(data.subtasks.map((st, i) => ({ ...st, id: i, checked: true })));
      setShowSuggestedSubtasksCard(true);

      logAiAction('Generated detailed AI subtask recommendations.');
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setAiLoading(prev => ({ ...prev, subtasks: false }));
    }
  };

  const handleRefineSuggestions = async () => {
    if (!chatInputText.trim()) return;
    setIsRefining(true);
    try {
      const res = await fetch(`http://localhost:5000/api/it-kanban/issues/${issue.issue_key || issue.key}/ai/refine-suggestions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: chatInputText,
          currentSuggestions: detailedSuggestedSubtasks
        })
      });
      if (!res.ok) throw new Error('Failed to refine suggestions');
      const data = await res.json();
      setDetailedSuggestedSubtasks(data.suggestions.map((st, i) => ({ ...st, id: i, checked: true })));
      setChatInputText('');

      logAiAction(`Refined subtask suggestions: "${chatInputText}"`);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setIsRefining(false);
    }
  };

  const handleAcceptSingleSuggestion = async (st, index) => {
    // 1. Add to inline subtasks list of parent issue
    const newSubtasks = [...subtasks];
    const maxId = newSubtasks.reduce((max, item) => item.id > max ? item.id : max, 0);
    const subtaskEntry = {
      id: maxId + 1,
      title: st.title,
      completed: false,
      priority: st.priority || 'Medium',
      assignee: st.suggested_assignee || 'Unassigned',
      estimate: st.estimated_hours || 4,
      sprint: st.sprint || 'Sprint 1'
    };
    newSubtasks.push(subtaskEntry);
    setSubtasks(newSubtasks);
    handleUpdate({ subtasks: newSubtasks });

    // 2. Create a real standalone Kanban board issue
    try {
      const parentKey = issue?.issue_key || issue?.key || '';
      const payload = {
        title: st.title,
        type: 'Task',
        status: 'TO DO',
        priority: st.priority || 'Medium',
        assignee: st.suggested_assignee || 'Unassigned',
        description: [
          st.description || '',
          '',
          `**Parent Issue:** ${parentKey}`,
          st.estimated_hours ? `**Estimated:** ${st.estimated_hours}h` : '',
          st.sprint ? `**Sprint:** ${st.sprint}` : '',
          st.category ? `**Category:** ${st.category}` : ''
        ].filter(Boolean).join('\n')
      };

      const res = await fetch('http://localhost:5000/api/it-kanban/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to create Kanban issue');

      // 3. Refresh Kanban board
      if (onIssueCreated) onIssueCreated();
    } catch (err) {
      console.error('Error creating Kanban issue from suggestion:', err);
    }

    // 4. Remove from suggestions list
    setDetailedSuggestedSubtasks(prev => prev.filter((_, idx) => idx !== index));

    logAiAction(`Accepted suggested subtask: "${st.title}"`);

    Swal.fire({
      icon: 'success',
      title: 'Task Created on Board!',
      html: `<b>"${st.title}"</b> has been added to the Kanban board under <b>TO DO</b>.`,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000
    });
  };

  const handleRejectSingleSuggestion = (index) => {
    setDetailedSuggestedSubtasks(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleEditSingleSuggestion = async (index) => {
    const item = detailedSuggestedSubtasks[index];
    const { value: newTitle } = await Swal.fire({
      title: 'Edit Suggestion Title',
      input: 'text',
      inputValue: item.title,
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Title cannot be empty!';
        }
      }
    });
    if (newTitle) {
      const copy = [...detailedSuggestedSubtasks];
      copy[index] = { ...copy[index], title: newTitle };
      setDetailedSuggestedSubtasks(copy);
    }
  };

  const handleSubtaskAiImprove = async (subtask, subtaskIndex) => {
    setSelectedSubtaskForAi({ subtask, index: subtaskIndex });
    Swal.showLoading();
    try {
      const res = await fetch(`http://localhost:5000/api/it-kanban/issues/${issue.issue_key || issue.key}/ai/subtask/${subtaskIndex}/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtaskTitle: subtask.title })
      });
      if (!res.ok) throw new Error('Failed to generate subtask improvements');
      const data = await res.json();
      setSubtaskAiDetails(data.improvement);
      setShowSubtaskAiModal(true);
      Swal.close();

      logAiAction(`Improved subtask "${subtask.title}" with AI.`);
    } catch (err) {
      Swal.close();
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleGenerateDocs = async () => {
    setAiLoading(prev => ({ ...prev, confluence: true }));
    try {
      const res = await fetch(`http://localhost:5000/api/it-kanban/issues/${issue.issue_key || issue.key}/ai/generate-docs`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to generate documentation suite');
      const data = await res.json();
      setDocsData(data);
      setActiveTab('AI Docs');

      logAiAction('Generated comprehensive technical documentation suite.');

      Swal.fire({
        icon: 'success',
        title: 'Documentation Generated',
        text: 'Specs, QA, and Deployment plans are ready in the AI Docs tab!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setAiLoading(prev => ({ ...prev, confluence: false }));
    }
  };

  const handleUpdate = (updates) => {
    if (updateIssue && issue) {
      updateIssue(issue.issue_key || issue.key, updates);
    }
  };


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

      // Attempt to map assignee string back to object if possible
      setAssignee(issue.assignee || { name: 'Unassigned' });


      setSubtasks(issue.subtasks || []);
      setLinkedIssues(issue.linked_issues || []);
      setComments(issue.comments || []);
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
        setAssignee({ name: 'Unassigned' });
      }

      // Check duplicates
      const checkDuplicates = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/it-kanban/issues/${issue.issue_key || issue.key}/ai/check-duplicates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: issue.title || '' })
          });
          if (res.ok) {
            const data = await res.json();
            setDuplicateWarning(data.duplicates || []);
          }
        } catch (err) {
          console.error(err);
        }
      };
      checkDuplicates();
      setDocsData(null);
      setIsImprovingSideBySide(false);

      // Default parent etc.
      setParent('None');
      setStartDate('None');
      setTeam('None');
      setProgress(issue.progress || 0);
      setOriginalEstimate(issue.original_estimate || '0h');
      setRemainingEstimate(issue.remaining_estimate || '0h');
      setTimeSpent(issue.time_spent || '0h');
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



  const handleSaveDescription = () => {
    setDescription(tempDescription); setIsEditingDescription(false); handleUpdate({ description: tempDescription });
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
    <>
      {/* Backdrop for Expanded Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Main Container */}
      <div
        className={
          isExpanded
            ? "fixed inset-8 md:inset-x-24 md:inset-y-12 bg-white rounded shadow-2xl z-50 flex flex-col font-sans text-gray-800 overflow-hidden animate-fade-in"
            : "absolute right-0 top-0 bottom-0 w-[480px] border-l border-gray-200 bg-white flex flex-col flex-shrink-0 shadow-2xl z-20 animate-slide-left font-sans text-gray-800"
        }
      >

        {/* HEADER SECTION */}
        <div className="h-14 border-b border-gray-200 px-5 flex items-center justify-between bg-white shrink-0">

          {/* Breadcrumb Info */}
          <div className="flex items-center gap-1 text-sm text-gray-500 font-medium">
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
            {/* AI Task Actions */}




            {/* Watcher button */}
            <button
              onClick={handleWatchToggle}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded border transition ${isWatching
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
                  <div className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-700">
                    <Lock size={12} /> Restrict access
                  </div>
                  <div className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-gray-700">
                    <Paperclip size={12} /> Attach file
                  </div>
                  <hr className="my-1 border-gray-100" />
                  <div
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this issue?')) {
                        if (deleteIssue && issue) deleteIssue(issue.key);
                      }
                    }}
                    className="p-2 hover:bg-red-50 text-red-600 cursor-pointer"
                  >
                    Delete issue
                  </div>
                </div>
              )}
            </div>
            {/* Expand/Collapse */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 transition ml-2"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>

            {/* Close Sidebar */}
            <button onClick={onClose} className="p-1.5 rounded border border-gray-300 text-gray-500 hover:bg-gray-50 transition ml-1" title="Close">
              <X size={13} />
            </button>
          </div>
        </div>

        {/* SCROLLABLE PANEL CONTENT */}
        <div className={`flex-1 overflow-y-auto p-2 custom-scrollbar pb-24 ${isExpanded ? 'flex gap-8' : 'space-y-6'}`}>

          {/* Left Column (Main Content) */}
          <div className={`space-y-6 ${isExpanded ? 'w-2/3' : 'w-full'}`}>

            {duplicateWarning.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs flex gap-3 text-amber-800 animate-fade-in ">
                <span className="text-base shrink-0">⚠️</span>
                <div className="space-y-1.5">
                  <p className="">Potential Duplicate Issues Detected</p>
                  <p>AI identified {duplicateWarning.length} similar active/completed ticket(s):</p>
                  <ul className="list-disc pl-4 space-y-0.5 font-medium">
                    {duplicateWarning.slice(0, 3).map((dup, i) => (
                      <li key={i}>
                        <strong>{dup.key}: {dup.title}</strong> ({dup.similarity}% match, Status: {dup.status})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Title */}
            <div>
              {isEditingTitle ? (
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        setTitle(tempTitle); setIsEditingTitle(false); handleUpdate({ title: tempTitle });
                      } else if (e.key === 'Escape') {
                        setIsEditingTitle(false);
                      }
                    }}
                    className="w-full text-[22px]  text-gray-800 border-2 border-blue-500 rounded px-2.5 py-1.5 outline-none "
                    autoFocus
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded  hover:bg-gray-50 transition text-gray-700 bg-white">
                        <Plus size={16} />
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded  hover:bg-gray-50 transition text-gray-700 bg-white">
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setTitle(tempTitle); setIsEditingTitle(false); }}
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded  hover:bg-gray-50 transition text-gray-700 bg-white"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => setIsEditingTitle(false)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded  hover:bg-gray-50 transition text-gray-700 bg-white"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <h2
                  onClick={() => { setTempTitle(title); setIsEditingTitle(true); }}
                  className="text-[22px]  text-gray-800 leading-snug break-words hover:bg-gray-50 p-1.5 -ml-1.5 rounded cursor-pointer transition border border-transparent hover:border-gray-300"
                >
                  {title}
                </h2>
              )}
            </div>

            {/* Mini Actions Row */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Add attachment/item shortcut */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition "
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
                className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition "
                title="Add subtask"
              >
                <CheckSquare size={13} />
              </button>

              {/* Link issue shortcut */}
              <button
                onClick={() => setIsLinkingIssue(true)}
                className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition "
                title="Link work item"
              >
                <LinkIcon size={12} />
              </button>

              {/* Status Dropdown */}
              <div className="interactive-dropdown relative">
                <button
                  onClick={() => toggleDropdown('status-select')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs  tracking-wider rounded border font-semibold transition ${STATUS_COLORS[currentStatus] || STATUS_COLORS['TO DO']}`}
                >
                  <span>{currentStatus}</span>
                  <ChevronDown size={12} />
                </button>
                {openDropdown === 'status-select' && (
                  <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 text-xs">
                    {Object.keys(STATUS_COLORS).map(status => (
                      <div
                        key={status}
                        onClick={() => { setCurrentStatus(status); setOpenDropdown(null); handleUpdate({ status }); }}
                        className="p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between font-medium text-gray-700"
                      >
                        <span>{status}</span>
                        {currentStatus === status && <Check size={13} className="text-blue-600" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lightning bolt action */}
              <button className="w-7 h-7 rounded border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition ">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor"><path d="M11 21h-1l1-7H5.5L13 3h1l-1 7h5.5z" /></svg>
              </button>

              {/* Improve Task (AI Star Assist) */}
              <div className="interactive-dropdown relative">
                <button
                  disabled={Object.values(aiLoading).some(Boolean)}
                  onClick={() => toggleDropdown('header-ai-actions')}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-blue-400 bg-blue-50 text-gray-700 hover:bg-blue-100 transition font-medium text-[13px] mr-2 disabled:opacity-50"
                >
                  {Object.values(aiLoading).some(Boolean) ? (
                    <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Sparkles size={14} className="text-purple-600 fill-purple-200" />
                  )}
                  <span>{Object.values(aiLoading).some(Boolean) ? 'AI Working...' : 'Improve Task'}</span>
                </button>
                {openDropdown === 'header-ai-actions' && (
                  <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-gray-200 rounded shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-1.5 z-50 text-[14px]">
                    <div onClick={handleSideBySideImprove} className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-gray-700 transition">
                      <FileEdit size={16} className="text-gray-700" />
                      <span>Improve description</span>
                    </div>
                    <div onClick={handleLinkConfluence} className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-gray-700 transition">
                      <FileText size={16} className="text-gray-700" />
                      <span>Link Confluence content</span>
                    </div>
                    <div onClick={handleSummarizeComments} className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-gray-700 transition">
                      <AlignLeft size={16} className="text-gray-700" />
                      <span>Summarize comments</span>
                    </div>
                    <div onClick={handleDetailedSubtaskSuggest} className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-gray-700 transition">
                      <Network size={16} className="text-gray-700" />
                      <span>Suggest child work items</span>
                    </div>
                    <div onClick={handleLinkSimilar} className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-gray-700 transition">
                      <CopyCheck size={16} className="text-gray-700" />
                      <span>Link similar work items</span>
                    </div>
                    <div className="border-t border-gray-100 mt-1.5 pt-1.5 px-4 py-1.5 flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="#4D6BFE" />
                        <path d="M8 12l2.5 2.5L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-xs text-gray-400 font-medium tracking-wide">Powered by DeepSeek AI</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* DESCRIPTION SECTION */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs  text-gray-500 tracking-wide block">Description</label>
                {!isImprovingSideBySide && (
                  <button
                    onClick={handleSideBySideImprove}
                    disabled={aiLoading.description}
                    className="flex items-center gap-1 px-2 py-1 text-sm font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 transition  cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles size={11} className="text-indigo-600 fill-indigo-100" />
                    <span>{aiLoading.description ? 'Analyzing...' : '✨ Improve with AI'}</span>
                  </button>
                )}
              </div>

              {isImprovingSideBySide ? (
                <div className="border border-indigo-200 rounded p-3 bg-indigo-50/30 space-y-3  animate-fade-in">
                  <div className="flex items-center justify-between pb-1.5 border-b border-indigo-100">
                    <span className="text-xs  text-indigo-800 flex items-center gap-1">
                      <Sparkles size={12} className="text-indigo-600 animate-pulse" />
                      AI Side-by-Side Review
                    </span>
                    <span className="text-xs text-gray-500 font-medium">Verify changes before accepting</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left: Original */}
                    <div className="space-y-1">
                      <span className="text-xs  text-gray-400  tracking-wider block">Original Description</span>
                      <textarea
                        value={tempDescription}
                        onChange={(e) => setTempDescription(e.target.value)}
                        className="w-full text-xs p-2 border border-gray-300 rounded font-sans leading-relaxed h-44 bg-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    {/* Right: AI Improved */}
                    <div className="space-y-1">
                      <span className="text-xs  text-indigo-500  tracking-wider block">AI-Improved Version</span>
                      <div
                        className="w-full text-xs p-2 border border-indigo-200 rounded font-sans leading-relaxed h-44 overflow-y-auto bg-white whitespace-pre-line text-gray-800"
                        dangerouslySetInnerHTML={{ __html: improvedDescription }}
                      />
                    </div>
                  </div>

                  {/* Side-by-side actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-indigo-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setDescription(improvedDescription);
                          setTempDescription(improvedDescription);
                          setIsImprovingSideBySide(false);
                          handleUpdate({ description: improvedDescription });
                          logAiAction('Accepted AI improved description.');
                          Swal.fire({
                            icon: 'success',
                            title: 'Description Accepted',
                            text: 'The AI-improved description has been successfully saved!',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 3000
                          });
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold  transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          setIsImprovingSideBySide(false);
                          logAiAction('Rejected AI improved description.');
                        }}
                        className="px-3 py-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded text-xs font-semibold  transition"
                      >
                        Reject
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(improvedDescription.replace(/<\/?[^>]+(>|$)/g, ""));
                          Swal.fire({
                            icon: 'success',
                            title: 'Copied',
                            text: 'Text copied to clipboard!',
                            toast: true,
                            position: 'top-end',
                            showConfirmButton: false,
                            timer: 2000
                          });
                        }}
                        className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 rounded text-sm font-medium transition"
                      >
                        Copy
                      </button>
                      <button
                        onClick={handleSideBySideImprove}
                        disabled={aiLoading.description}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm font-medium transition flex items-center gap-1 disabled:opacity-50"
                      >
                        <Sparkles size={11} className="text-white shrink-0" />
                        <span>Regenerate</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Normal display
                <div>
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
                      className="text-xs text-gray-700 leading-relaxed max-h-[150px] overflow-auto hover:bg-gray-50 border border-transparent hover:border-gray-200 p-2.5 -ml-2.5 rounded cursor-pointer transition min-h-[36px]"
                    >
                      {description === 'Add a description...' ? (
                        <span className="text-gray-400">{description}</span>
                      ) : (
                        <div
                          className="whitespace-pre-line"
                          dangerouslySetInnerHTML={{ __html: description }}
                        />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SUBTASKS SECTION */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs  text-gray-500 tracking-wide block">Subtasks</label>
                <button
                  onClick={() => {
                    setIsAddingSubtask(!isAddingSubtask);
                    if (!isAddingSubtask) {
                      setTimeout(() => document.getElementById('subtask-input')?.focus(), 50);
                    }
                  }}
                  className="text-gray-500 hover:text-gray-800 p-1 rounded hover:bg-gray-100 transition"
                  title="Add subtask"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="space-y-1.5">
                {subtasks.map((st, idx) => (
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
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSubtaskAiImprove(st, idx)}
                        className="text-indigo-500 hover:text-indigo-700 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-indigo-50 transition cursor-pointer"
                        title="✨ AI Subtask Spec Sheet"
                      >
                        <Sparkles size={11} className="fill-indigo-100" />
                      </button>
                      <button
                        onClick={() => deleteSubtask(st.id)}
                        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1 rounded transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* INLINE AI ASSISTANT SUGGESTIONS CARD */}
              {detailedSuggestedSubtasks.length > 0 && (
                <div className="border border-indigo-200 rounded overflow-hidden bg-indigo-50/10  animate-fade-in my-3">
                  {/* Header */}
                  <div
                    onClick={() => setShowSuggestedSubtasksCard(!showSuggestedSubtasksCard)}
                    className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-indigo-200 cursor-pointer hover:bg-indigo-100/50 transition select-none"
                  >
                    <div className="flex items-center gap-2 text-indigo-800  text-xs font-sans">
                      <Sparkles size={13} className="text-indigo-600 fill-indigo-100 animate-pulse animate-duration-1000" />
                      <span>Create suggested work items</span>
                    </div>
                    <button className="text-gray-500 bg-transparent border-none">
                      {showSuggestedSubtasksCard ? (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m18 15-6-6-6 6" /></svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6" /></svg>
                      )}
                    </button>
                  </div>

                  {/* Suggestions List & Chat box */}
                  {showSuggestedSubtasksCard && (
                    <div className="p-2 space-y-2.5 bg-white">
                      <div className="divide-y divide-gray-100 max-h-[250px] overflow-y-auto">
                        {detailedSuggestedSubtasks.map((st, i) => st && (
                          <div
                            key={i}
                            className="flex items-center justify-between group py-1.5 px-2 hover:bg-gray-50/70 rounded transition text-xs font-sans"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              {/* Branch Icon */}
                              <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="6" y1="3" x2="6" y2="15"></line>
                                <circle cx="18" cy="6" r="3"></circle>
                                <circle cx="6" cy="18" r="3"></circle>
                                <path d="M18 9a9 9 0 0 1-9 9"></path>
                              </svg>
                              <span className="text-gray-700 font-medium leading-tight">
                                {st.title}
                              </span>
                            </div>

                            {/* Hover Actions */}
                            <div className="flex items-center gap-2.5 pl-2 opacity-0 group-hover:opacity-100 transition shrink-0">
                              <button
                                onClick={() => handleAcceptSingleSuggestion(st, i)}
                                className="text-green-600 hover:text-green-800  text-sm transition cursor-pointer"
                                title="Accept / Create real subtask"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => handleRejectSingleSuggestion(i)}
                                className="text-gray-400 hover:text-red-500  text-xs transition cursor-pointer"
                                title="Dismiss / Reject"
                              >
                                ✕
                              </button>
                              <button
                                onClick={() => handleEditSingleSuggestion(i)}
                                className="text-gray-400 hover:text-blue-600 transition cursor-pointer"
                                title="Edit Title"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" /></svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Prompts / Chat Input */}
                      <div className="relative border border-gray-300 rounded-md  bg-white overflow-hidden flex items-center pr-2">
                        <input
                          type="text"
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                          placeholder={isRefining ? "AI is typing..." : "What should I do next?"}
                          disabled={isRefining}
                          onKeyDown={(e) => e.key === 'Enter' && handleRefineSuggestions()}
                          className="flex-1 text-xs outline-none border-none py-2 px-3 focus:ring-0 placeholder-gray-400 text-gray-800 font-sans"
                        />
                        <button
                          onClick={handleRefineSuggestions}
                          disabled={isRefining || !chatInputText.trim()}
                          className="text-indigo-600 hover:text-indigo-800 disabled:opacity-30 transition cursor-pointer bg-transparent border-none"
                        >
                          {isRefining ? (
                            <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4 fill-current transform rotate-90" viewBox="0 0 24 24">
                              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" stroke="none" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {isAddingSubtask && (
                <div className="space-y-2 mt-2">
                  {/* AI suggestion banner */}
                  <div className="border border-gray-200 rounded p-2 flex items-center justify-between bg-white text-xs ">
                    <div className="flex items-center gap-2 text-gray-600 font-medium">
                      <Sparkles size={13} className="text-indigo-500 fill-indigo-100 animate-pulse" />
                      <span>Create suggested work i...</span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={handleDetailedSubtaskSuggest}
                        disabled={aiLoading.subtasks}
                        className="border border-gray-200 rounded px-2.5 py-1 text-sm text-gray-700  hover:bg-gray-50 bg-white transition  cursor-pointer disabled:opacity-50"
                      >
                        {aiLoading.subtasks ? 'Suggesting...' : 'Detailed AI Checklist'}
                      </button>
                      <button
                        onClick={handleSuggestSubtasks}
                        disabled={aiLoading.subtasks}
                        className="border border-gray-200 rounded px-2.5 py-1 text-sm text-gray-700  hover:bg-gray-50 bg-white transition  cursor-pointer disabled:opacity-50"
                      >
                        Suggest
                      </button>
                    </div>
                  </div>

                  {/* Subtask Input Wrapper */}
                  <div className="border border-blue-500 ring-1 ring-blue-500 rounded p-1.5 flex items-center justify-between bg-white gap-2 ">
                    <input
                      id="subtask-input"
                      type="text"
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Name this subtask"
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                      className="flex-1 text-xs outline-none bg-transparent py-0.5 border-none focus:ring-0 placeholder-gray-400 text-gray-800 font-medium"
                    />

                    {/* Type icon selector mock */}
                    <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-xs text-gray-500 font-medium cursor-pointer">
                      <svg className="w-3 h-3 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" /><path d="M9 6h6v9" /></svg>
                      <span>Subtask</span>
                      <ChevronDown size={10} />
                    </div>

                    {/* Enter Button */}
                    <button
                      onClick={handleAddSubtask}
                      disabled={!newSubtaskTitle.trim()}
                      className={`w-6 h-6 rounded flex items-center justify-center transition border ${newSubtaskTitle.trim()
                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                        : 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
                        }`}
                    >
                      <CornerDownLeft size={11} />
                    </button>
                  </div>

                  {/* Bottom Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <button className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold hover:underline bg-transparent">
                      <Search size={13} />
                      <span>Choose existing</span>
                    </button>
                    <button
                      onClick={() => setIsAddingSubtask(false)}
                      className="text-xs text-gray-500 hover:text-gray-800 font-semibold bg-transparent px-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* LINKED WORK ITEMS */}
            <div className="space-y-3">
              <label className="text-xs  text-gray-500 tracking-wide block">Linked work items</label>

              <div className="space-y-2">
                {linkedIssues.map(li => (
                  <div key={li.key} className="flex items-center justify-between text-xs border border-gray-100 p-2 rounded bg-gray-50/50 hover:bg-gray-50 group transition">
                    <div className="flex items-center gap-2">
                      <CornerDownRight size={13} className="text-gray-400" />
                      <span className="font-semibold text-gray-500 ">{li.relation}</span>
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

            {/* ACTIVITY SECTION */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-900">Activity</h3>

              {/* Activity tabs */}
              <div className="flex items-center justify-between border-b border-gray-200 pb-1">
                <div className="flex gap-4 text-xs font-semibold">
                  {['All', 'Comments', 'History', 'Work log', 'AI Docs'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 transition relative ${activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600 -mb-[9px]'
                        : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <button className="text-xs text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1">
                  <span>Newest first</span>
                  <ChevronDown size={11} />
                </button>
              </div>

              {/* Comments content */}
              {activeTab === 'Comments' && (
                <div className="space-y-4">

                  {/* Comment add box */}
                  <div className="flex gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs  shrink-0 bg-teal-100 text-teal-700`}>CI</div>
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
                            <span className="text-xs text-gray-400 font-normal">
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
                      <span className="text-xs text-gray-400 block px-1">
                        Pro tip: press <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-300 rounded text-[9px] font-mono">M</kbd> to comment
                      </span>
                    </div>
                  </div>

                  {/* Render Comments List */}
                  <div className="space-y-3.5 pt-2">
                    {comments.map(c => (
                      <div key={c.id} className="flex gap-2.5 text-xs group">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs  shrink-0 ${c.color}`}>{c.initial}</div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className=" text-gray-800">{c.author}</span>
                            <span className="text-xs text-gray-400">{c.date}</span>
                          </div>
                          <p className="text-gray-700 leading-relaxed break-words font-medium">{c.text}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
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

              {activeTab === 'AI Docs' && (
                <div className="space-y-4 animate-fade-in text-xs">
                  {!docsData ? (
                    <div className="text-center py-8 border border-dashed border-gray-200 rounded space-y-3 bg-gray-50/50">
                      <FileText className="mx-auto text-gray-300" size={32} />
                      <p className="text-xs text-gray-500">No technical documentation compiled yet.</p>
                      <button
                        onClick={handleGenerateDocs}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold  transition flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <Sparkles size={11} className="fill-blue-100 text-white animate-pulse" />
                        Generate Technical Docs Suite
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-indigo-50 border border-indigo-100 p-2.5 rounded">
                        <span className="text-xs  text-indigo-800 flex items-center gap-1">
                          <Sparkles size={13} className="text-indigo-600 fill-indigo-100" />
                          AI Documentation Suite
                        </span>
                        <button
                          onClick={handleGenerateDocs}
                          className="px-2 py-1 text-xs bg-white border border-gray-200 text-gray-600 rounded hover:bg-gray-50 transition cursor-pointer"
                        >
                          Regenerate
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className=" text-gray-800  tracking-wider text-[9px] mb-1">Implementation Plan</h4>
                          <div className="bg-white border border-gray-200 rounded p-2.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: docsData.implementation_plan }} />
                        </div>
                        <div>
                          <h4 className=" text-gray-800  tracking-wider text-[9px] mb-1">QA Testing Checklist</h4>
                          <div className="bg-white border border-gray-200 rounded p-2.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: docsData.qa_checklist }} />
                        </div>
                        <div>
                          <h4 className=" text-gray-800  tracking-wider text-[9px] mb-1">Deployment Roadmap</h4>
                          <div className="bg-white border border-gray-200 rounded p-2.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: docsData.deployment_checklist }} />
                        </div>
                        <div>
                          <h4 className=" text-gray-800  tracking-wider text-[9px] mb-1">Rollback Plan</h4>
                          <div className="bg-white border border-gray-200 rounded p-2.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: docsData.rollback_checklist }} />
                        </div>
                        <div>
                          <h4 className=" text-gray-800  tracking-wider text-[9px] mb-1">API & Technical Specs</h4>
                          <div className="bg-white border border-gray-200 rounded p-2.5 leading-relaxed font-mono whitespace-pre-line" dangerouslySetInnerHTML={{ __html: docsData.api_documentation }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab !== 'Comments' && activeTab !== 'AI Docs' && (
                <p className="text-xs text-gray-400 text-center py-4">No activity to show in {activeTab}.</p>
              )}

            </div>
          </div>
          {/* Right Column (Details) */}
          <div className={`${isExpanded ? 'w-1/3 border-l border-gray-200 pl-8 space-y-6' : 'w-full space-y-6'}`}>

            {isExpanded && (
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <div className="interactive-dropdown relative">
                  <button onClick={() => toggleDropdown('status-select')} className={`flex items-center gap-1.5 p-2 rounded text-xs  transition ${STATUS_COLORS[currentStatus] || STATUS_COLORS['TO DO']}`}>
                    {currentStatus} <ChevronDown size={12} className="opacity-70" />
                  </button>
                  {openDropdown === 'status-select' && (
                    <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 text-xs">
                      {Object.keys(STATUS_COLORS).map(status => (
                        <div
                          key={status}
                          onClick={() => { setCurrentStatus(status); setOpenDropdown(null); handleUpdate({ status }); }}
                          className="p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between font-medium text-gray-700"
                        >
                          <span>{status}</span>
                          {currentStatus === status && <Check size={13} className="text-blue-600" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button className="flex items-center justify-center p-1.5 border border-gray-300 rounded hover:bg-gray-50 transition text-gray-600"><Zap size={14} /></button>
                <div className="interactive-dropdown relative">
                  <button
                    disabled={Object.values(aiLoading).some(Boolean)}
                    onClick={() => toggleDropdown('side-ai-actions')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-300 rounded hover:bg-gray-50 transition text-xs font-semibold text-gray-700 disabled:opacity-50"
                  >
                    {Object.values(aiLoading).some(Boolean) ? (
                      <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Sparkles size={13} className="text-purple-600" />
                    )}
                    <span>{Object.values(aiLoading).some(Boolean) ? 'AI Working...' : 'Improve Task'}</span>
                  </button>
                  {openDropdown === 'side-ai-actions' && (
                    <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border border-gray-200 rounded shadow-[0_4px_12px_rgba(0,0,0,0.1)] py-1.5 z-50 text-[14px]">
                      <div onClick={handleSideBySideImprove} className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-gray-700 transition font-normal font-sans">
                        <FileEdit size={16} className="text-gray-700" />
                        <span>Improve description</span>
                      </div>
                      <div onClick={handleLinkConfluence} className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-gray-700 transition font-normal font-sans">
                        <FileText size={16} className="text-gray-700" />
                        <span>Link Confluence content</span>
                      </div>
                      <div onClick={handleSummarizeComments} className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-gray-700 transition font-normal font-sans">
                        <AlignLeft size={16} className="text-gray-700" />
                        <span>Summarize comments</span>
                      </div>
                      <div onClick={handleDetailedSubtaskSuggest} className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-gray-700 transition font-normal font-sans">
                        <Network size={16} className="text-gray-700" />
                        <span>Suggest child work items</span>
                      </div>
                      <div onClick={handleLinkSimilar} className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-gray-700 transition font-normal">
                        <CopyCheck size={16} className="text-gray-700" />
                        <span>Link similar work items</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* COLLAPSIBLE DETAILS */}
            <div className="border border-gray-200 rounded">
              <div
                onClick={() => toggleSection('details')}
                className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-1.5">
                  {collapsedSections.details ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  <span className="text-xs  text-gray-700  tracking-wide">Details</span>
                </div>
                <Settings size={14} className="text-gray-400 hover:text-gray-600" />
              </div>

              {/* Details Content */}
              {!collapsedSections.details && (
                <div className="p-3.5 space-y-3.5 text-xs bg-white">

                  {/* Assignee */}
                  <div className="grid grid-cols-3 items-center min-h-[30px]">
                    <span className="text-gray-500 font-medium text-xs">Assignee</span>
                    <div className="col-span-2 interactive-dropdown relative">
                      {openDropdown === 'details-assignee' ? (
                        <div className="w-full">
                          {/* Active Selector Input */}
                          <div
                            onClick={() => toggleDropdown('details-assignee')}
                            className="flex items-center gap-2 border border-blue-500 ring-1 ring-blue-500 rounded px-1.5 py-1 bg-white  cursor-text mb-1"
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs  shrink-0 ${assignee.name === 'Unassigned' || assignee.name === 'Automatic' ? 'bg-gray-200 text-gray-500' : assignee.color}`}>
                              {assignee.name === 'Unassigned' || assignee.name === 'Automatic' ? <User size={12} /> : assignee.initial}
                            </div>
                            <span className="bg-blue-500 text-white px-1 py-0.5 text-[13px] flex-1 rounded-sm cursor-text outline-none">{assignee.name}</span>
                          </div>

                          {/* Dropdown menu */}
                          <div className="absolute left-0 top-full bg-white border border-gray-200 rounded-b shadow-lg z-50 min-w-[260px] max-h-64 overflow-y-auto custom-scrollbar">

                            {/* 1. Assign to me */}
                            {(() => {
                              const me = USERS.find(u => u.name === 'codigix infotech');
                              const isActive = me && me.name === assignee.name;
                              return me ? (
                                <div
                                  onClick={() => { setAssignee(me); setOpenDropdown(null); }}
                                  className={`p-2.5 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition ${isActive ? 'bg-gray-50 border-l-[3px] border-blue-600' : 'pl-[15px]'}`}
                                >
                                  <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${me.color}`}>
                                    {me.initial}
                                  </div>
                                  <span className="text-gray-800 text-[14px]">{me.name} <span className="text-gray-500">(Assign to me)</span></span>
                                </div>
                              ) : null;
                            })()}

                            {/* 2. Automatic */}
                            <div
                              onClick={() => { setAssignee({ name: 'Automatic' }); setOpenDropdown(null); }}
                              className={`p-2.5 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition pl-[15px]`}
                            >
                              <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center bg-gray-200 text-gray-500 shrink-0">
                                <User size={14} />
                              </div>
                              <span className="text-gray-800 text-[14px]">Automatic</span>
                            </div>

                            {/* 3. Other Users */}
                            {USERS.filter(u => u.name !== 'codigix infotech').map(u => {
                              const isActive = u.name === assignee.name;
                              return (
                                <div
                                  key={u.name + u.color}
                                  onClick={() => { setAssignee(u); setOpenDropdown(null); handleUpdate({ assignee: u.name }); }}
                                  className={`p-2.5 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition ${isActive ? 'bg-gray-50 border-l-[3px] border-blue-600' : 'pl-[15px]'}`}
                                >
                                  <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${u.color}`}>
                                    {u.initial}
                                  </div>
                                  <span className="text-gray-800 text-[14px]">{u.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => toggleDropdown('details-assignee')}
                          className="flex items-center gap-2 hover:bg-gray-50 p-1 -ml-1 rounded cursor-pointer transition text-gray-800 w-fit"
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs  shrink-0 ${assignee.name === 'Unassigned' || assignee.name === 'Automatic' ? 'bg-gray-200 text-gray-500' : assignee.color}`}>
                            {assignee.name === 'Unassigned' || assignee.name === 'Automatic' ? <User size={12} /> : assignee.initial}
                          </div>
                          <span className="text-[13px] text-gray-700">{assignee.name}</span>
                          {assignee.name !== 'codigix infotech' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const me = USERS.find(u => u.name === 'codigix infotech');
                                if (me) {
                                  setAssignee(me);
                                  handleUpdate({ assignee: me.name });
                                }
                              }}
                              className="text-sm text-blue-600 hover:underline font-semibold ml-2.5 cursor-pointer"
                            >
                              Assign to me
                            </button>
                          )}
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
                          <span key={l} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-medium text-xs">
                            {l}
                          </span>
                        ))
                      )}
                      <span className="text-gray-400 hover:text-gray-600 cursor-pointer text-xs ml-1 ">+</span>
                    </div>
                  </div>

                  {/* Parent */}
                  <div className="grid grid-cols-3 items-center min-h-[30px]">
                    <span className="text-gray-500 font-medium flex items-center gap-1">
                      Parent <Info size={12} className="text-gray-400 cursor-pointer" />
                    </span>
                    <div className="col-span-2 interactive-dropdown relative">
                      {openDropdown === 'details-parent' ? (
                        <div className="w-full">
                          {/* Selector with blue border */}
                          <div
                            onClick={() => toggleDropdown('details-parent')}
                            className="flex items-center justify-between border border-blue-500 ring-1 ring-blue-500 rounded px-2.5 py-1.5 bg-white text-gray-800 text-xs font-semibold cursor-pointer "
                          >
                            <span>{parent === 'None' ? 'Select parent' : parent}</span>
                            <ChevronDown size={12} className="text-gray-500" />
                          </div>

                          {/* Dropdown menu */}
                          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded shadow-lg py-2.5 px-3 z-50 text-xs text-gray-800 min-w-[200px]">
                            <div className="flex items-center gap-2 mb-2 font-medium text-gray-700">
                              <input
                                type="checkbox"
                                id="show-done-items"
                                checked={showDoneWorkItems}
                                onChange={(e) => setShowDoneWorkItems(e.target.checked)}
                                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <label htmlFor="show-done-items" className="cursor-pointer select-none">Show done work items</label>
                            </div>
                            <hr className="my-2 border-gray-100" />
                            <div className="text-center py-2 text-gray-400 font-medium font-sans">
                              No matches found
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => toggleDropdown('details-parent')}
                          className="hover:bg-gray-50 p-1 -ml-1 rounded cursor-pointer transition text-gray-400 font-semibold w-fit flex items-center gap-1"
                        >
                          <span>{parent}</span>
                          <ChevronDown size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sprint */}
                  <div className="grid grid-cols-3 items-center min-h-[30px]">
                    <span className="text-gray-500 font-medium">Sprint</span>
                    <div className="col-span-2 interactive-dropdown relative">
                      {openDropdown === 'details-sprint' ? (
                        <div className="w-full">
                          <div
                            onClick={() => toggleDropdown('details-sprint')}
                            className="flex items-center justify-between border border-blue-500 ring-1 ring-blue-500 rounded px-2.5 py-1.5 bg-white text-gray-800 text-xs font-semibold cursor-pointer "
                          >
                            <span>{sprint}</span>
                            <ChevronDown size={12} className="text-gray-500" />
                          </div>
                          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded shadow-lg py-1 z-50 text-xs text-gray-800">
                            {SPRINTS.map(s => (
                              <div
                                key={s}
                                onClick={() => { setSprint(s); setOpenDropdown(null); }}
                                className="p-2 hover:bg-gray-50 cursor-pointer"
                              >
                                {s}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => toggleDropdown('details-sprint')}
                          className="hover:bg-gray-50 p-1 -ml-1 rounded cursor-pointer transition text-gray-400 font-semibold w-fit flex items-center gap-1"
                        >
                          <span>{sprint}</span>
                          <ChevronDown size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Start Date */}
                  <div className="grid grid-cols-3 items-center min-h-[30px]">
                    <span className="text-gray-500 font-medium">Start date</span>
                    <span className="col-span-2 text-gray-500 font-medium">{startDate}</span>
                  </div>

                  {/* Due Date */}
                  <div className="grid grid-cols-3 items-center min-h-[30px]">
                    <span className="text-gray-500 font-medium flex items-center gap-1 text-xs">
                      Due date <Pin size={12} className="text-gray-400 rotate-45 cursor-pointer hover:text-gray-600 transition" />
                    </span>
                    <div className="col-span-2 interactive-dropdown relative">
                      {openDropdown === 'details-due' ? (
                        <div className="w-full">
                          {/* Input field with Calendar button */}
                          <div
                            onClick={() => toggleDropdown('details-due')}
                            className="flex items-center border border-blue-500 ring-1 ring-blue-500 rounded bg-white overflow-hidden  cursor-pointer"
                          >
                            <input
                              type="text"
                              readOnly
                              value={dueDate === 'None' ? '07/13/2026' : dueDate}
                              className="flex-1 text-xs px-2.5 py-1.5 outline-none font-semibold text-gray-800 pointer-events-none"
                            />
                            <div className="p-1.5 bg-gray-50 border-l border-gray-200 text-gray-600 flex items-center justify-center">
                              <Calendar size={14} />
                            </div>
                          </div>

                          {/* Calendar Dropdown */}
                          <div className="absolute left-0 top-full mt-1.5 bg-white border border-gray-200 rounded shadow-xl p-3 z-50 text-xs text-gray-800 w-[240px]">

                            {/* Month Navigation */}
                            <div className="flex justify-between items-center mb-3 text-gray-700  px-1">
                              <div className="flex gap-1.5">
                                <span className="cursor-pointer hover:text-blue-600 text-gray-400"><ChevronsLeft size={13} /></span>
                                <span className="cursor-pointer hover:text-blue-600 text-gray-400"><ChevronLeft size={13} /></span>
                              </div>
                              <span className="font-sans">July 2026</span>
                              <div className="flex gap-1.5">
                                <span className="cursor-pointer hover:text-blue-600 text-gray-400"><ChevronRight size={13} /></span>
                                <span className="cursor-pointer hover:text-blue-600 text-gray-400"><ChevronsRight size={13} /></span>
                              </div>
                            </div>

                            {/* Weekday Labels */}
                            <div className="grid grid-cols-7 gap-1 text-center text-xs  text-gray-500 mb-1.5 font-sans">
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <span key={d}>{d}</span>
                              ))}
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-700 font-sans">
                              {/* Prev Month Days (grayed out) */}
                              {[28, 29, 30].map(d => (
                                <span key={`prev-${d}`} className="py-1 text-gray-300 rounded">{d}</span>
                              ))}

                              {/* Current Month Days */}
                              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                                const dateStr = `07/${day < 10 ? '0' + day : day}/2026`;
                                const isSelected = (dueDate === 'None' && day === 13) || dueDate === dateStr || dueDate === `7/${day}/2026`;
                                return (
                                  <span
                                    key={`curr-${day}`}
                                    onClick={() => { setDueDate(dateStr); setOpenDropdown(null); }}
                                    className={`py-1 rounded cursor-pointer transition hover:bg-gray-100 relative ${isSelected
                                      ? 'text-blue-600  border-b-2 border-blue-600'
                                      : ''
                                      }`}
                                  >
                                    {day}
                                  </span>
                                );
                              })}

                              {/* Next Month Days (grayed out) */}
                              {[1, 2, 3, 4, 5, 6, 7, 8].map(d => (
                                <span key={`next-${d}`} className="py-1 text-gray-300 rounded">{d}</span>
                              ))}
                            </div>

                            {/* Separator */}
                            <hr className="my-3 border-gray-100" />

                            {/* Set to Recur Row */}
                            <div className="flex items-center justify-between text-gray-600 hover:text-gray-800 cursor-pointer pt-1 px-1 transition group">
                              <div className="flex items-center gap-2  text-sm font-sans">
                                <Repeat size={13} className="text-gray-400 group-hover:text-gray-600" />
                                <span>Set to recur</span>
                              </div>
                              <ChevronRight size={13} className="text-gray-400" />
                            </div>

                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => toggleDropdown('details-due')}
                          className="hover:bg-gray-50 p-1 -ml-1 rounded cursor-pointer transition text-gray-800 font-semibold w-fit flex items-center gap-1.5"
                        >
                          <Calendar size={13} className="text-gray-400" />
                          <span>{dueDate === 'None' ? '07/13/2026' : dueDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reporter */}
                  <div className="grid grid-cols-3 items-center min-h-[30px]">
                    <span className="text-gray-500 font-medium flex items-center gap-1 text-xs">
                      Reporter <Pin size={12} className="text-gray-400 rotate-45 cursor-pointer hover:text-gray-600 transition" />
                    </span>
                    <div className="col-span-2 interactive-dropdown relative">
                      {openDropdown === 'details-reporter' ? (
                        <div className="w-full">
                          {/* Active Selector Input */}
                          <div
                            onClick={() => toggleDropdown('details-reporter')}
                            className="flex items-center gap-2 border border-blue-500 ring-1 ring-blue-500 rounded px-1.5 py-1 bg-white  cursor-text mb-1"
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs  shrink-0 ${reporter.color}`}>{reporter.initial}</div>
                            <span className="bg-blue-500 text-white px-1 py-0.5 text-[13px] flex-1 rounded-sm cursor-text outline-none">{reporter.name}</span>
                          </div>

                          {/* Dropdown menu */}
                          <div className="absolute left-0 top-full bg-white border border-gray-200 rounded-b shadow-lg z-50 min-w-[260px] max-h-64 overflow-y-auto custom-scrollbar">
                            {USERS.map(u => {
                              const isActive = u.name === reporter.name && u.color === reporter.color;
                              return (
                                <div
                                  key={u.name + u.color}
                                  onClick={() => { setReporter(u); setOpenDropdown(null); handleUpdate({ reporter: u.name }); }}
                                  className={`p-2.5 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition ${isActive ? 'bg-gray-50 border-l-[3px] border-blue-600' : 'pl-[15px]'}`}
                                >
                                  <div className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${u.color}`}>
                                    {u.initial}
                                  </div>
                                  <span className="text-gray-800 text-[14px]">{u.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => toggleDropdown('details-reporter')}
                          className="flex items-center gap-2 hover:bg-gray-50 p-1 -ml-1 rounded cursor-pointer transition text-gray-800 w-fit"
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs  shrink-0 ${reporter.color}`}>{reporter.initial}</div>
                          <span className="text-[13px] text-gray-700">{reporter.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Team */}
                  <div className="grid grid-cols-3 items-center min-h-[30px]">
                    <span className="text-gray-500 font-medium">Team</span>
                    <div className="col-span-2 interactive-dropdown relative">
                      {openDropdown === 'details-team' ? (
                        <div className="w-full">
                          {/* Selector with blue border */}
                          <div
                            onClick={() => toggleDropdown('details-team')}
                            className="flex items-center gap-2 border border-blue-500 ring-1 ring-blue-500 rounded px-2.5 py-1.5 bg-white text-gray-800 text-xs font-semibold cursor-pointer "
                          >
                            <User size={14} className="text-gray-400" />
                            <span>{team === 'None' ? 'Choose a team' : team}</span>
                          </div>

                          {/* Dropdown menu */}
                          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-gray-200 rounded shadow-lg py-1.5 z-50 text-xs text-gray-800 min-w-[220px]">
                            {[
                              { name: 'IT Team', members: 5, verified: true },
                              { name: 'marketing-team', members: 6, verified: false }
                            ].map(t => (
                              <div
                                key={t.name}
                                onClick={() => { setTeam(t.name); setOpenDropdown(null); }}
                                className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2.5 transition"
                              >
                                {/* Round orange square icon */}
                                <div className="w-8 h-8 rounded bg-rose-100 text-rose-500 flex items-center justify-center shrink-0">
                                  <User size={16} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1  text-gray-800">
                                    <span className="truncate">{t.name}</span>
                                    {t.verified && <Check size={12} className="text-blue-500 fill-blue-100 shrink-0" />}
                                  </div>
                                  <div className="text-xs text-gray-400">Team • {t.members} members, including you</div>
                                </div>
                              </div>
                            ))}

                            <hr className="my-1.5 border-gray-100" />

                            <div
                              onClick={() => { setTeam('New Team'); setOpenDropdown(null); }}
                              className="px-3.5 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-2 text-xs  text-gray-700 transition"
                            >
                              <Plus size={14} />
                              <span>Create a team</span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => toggleDropdown('details-team')}
                          className="hover:bg-gray-50 p-1 -ml-1 rounded cursor-pointer transition text-gray-400 font-semibold w-fit flex items-center gap-1"
                        >
                          <span>{team}</span>
                          <ChevronDown size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* COLLAPSIBLE DEVELOPMENT */}
            <div className="border border-gray-200 rounded">

              <div
                onClick={() => toggleSection('development')}
                className="flex items-center gap-1.5 p-2 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
              >
                {collapsedSections.development ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                <span className="text-xs  text-gray-700  tracking-wide">Development</span>
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
            <div className="border border-gray-200 rounded">

              <div
                onClick={() => toggleSection('automation')}
                className="flex items-center justify-between p-2 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-1.5">
                  {collapsedSections.automation ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  <span className="text-xs  text-gray-700  tracking-wide">Automation</span>
                </div>
                <Settings size={14} className="text-gray-400 hover:text-gray-600" />
              </div>

              {!collapsedSections.automation && (
                <div className="p-3.5 space-y-3 bg-white text-xs">
                  <div className="flex justify-between items-center">
                    <span className=" text-gray-700">Recent rule runs</span>
                    <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition">
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
                    <div className="flex flex-col text-xs text-gray-400 text-right">
                      <span>Created 6 hours ago</span>
                      <span>Updated 6 hours ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Fullscreen AI Suggested Modal Removed in favor of inline card assistant */}

        {/* NESTED SUBTASK AI IMPROVEMENT MODAL */}
        {showSubtaskAiModal && subtaskAiDetails && selectedSubtaskForAi && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[999] animate-fade-in p-4">
            <div className="bg-white rounded shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[80vh]">
              <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-purple-600 fill-purple-100 animate-pulse" />
                  <h3 className=" text-gray-800 text-sm font-sans">
                    Subtask Specifications: {selectedSubtaskForAi.subtask.title}
                  </h3>
                </div>
                <button onClick={() => setShowSubtaskAiModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs font-sans">
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded border border-gray-100">
                  <div>
                    <span className="font-semibold text-gray-500 block">Recommended Assignee & Availability:</span>
                    <span className=" text-gray-800">{selectedSubtaskForAi.subtask.assignee || 'Olivia Taylor'} (Free - 8h workload)</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block">Sprint & Priority Recommendation:</span>
                    <span className=" text-gray-800">{subtaskAiDetails.sprint || 'Sprint 1'} - {subtaskAiDetails.priority || 'Medium'} ({subtaskAiDetails.story_points || 3} SP)</span>
                  </div>
                </div>

                <div>
                  <span className=" text-indigo-700 block mb-1">Acceptance Criteria</span>
                  <div className="bg-white border border-gray-200 rounded p-2.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: subtaskAiDetails.acceptance_criteria }} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className=" text-gray-700 block mb-1">Developer Checklist</span>
                    <ul className="list-disc pl-4 space-y-1 bg-white border border-gray-200 rounded p-2.5 leading-relaxed">
                      {subtaskAiDetails.developer_checklist.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <span className=" text-gray-700 block mb-1">Testing Checklist</span>
                    <ul className="list-disc pl-4 space-y-1 bg-white border border-gray-200 rounded p-2.5 leading-relaxed">
                      {subtaskAiDetails.testing_checklist.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  </div>
                </div>

                <div>
                  <span className=" text-red-600 block mb-1">Risk Analysis & Dependency Mapping</span>
                  <div className="bg-red-50/30 border border-red-100 rounded p-2.5 space-y-1 leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: subtaskAiDetails.risk_analysis }} />
                    <p className="mt-1"><strong>Dependencies:</strong> {subtaskAiDetails.dependency_mapping}</p>
                  </div>
                </div>

                <div>
                  <span className=" text-gray-700 block mb-1">Implementation Notes</span>
                  <div className="bg-white border border-gray-200 rounded p-2.5 leading-relaxed" dangerouslySetInnerHTML={{ __html: subtaskAiDetails.implementation_notes }} />
                </div>
              </div>

              <div className="p-3 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 font-sans">
                <button
                  onClick={() => setShowSubtaskAiModal(false)}
                  className="px-3.5 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded font-semibold transition cursor-pointer"
                >
                  Reject / Close
                </button>
                <button
                  onClick={() => {
                    const copy = [...subtasks];
                    const targetIdx = selectedSubtaskForAi.index;
                    copy[targetIdx] = {
                      ...copy[targetIdx],
                      title: `${copy[targetIdx].title} (SP: ${subtaskAiDetails.story_points})`,
                      aiSpecs: subtaskAiDetails
                    };
                    setSubtasks(copy);
                    handleUpdate({ subtasks: copy });
                    setShowSubtaskAiModal(false);

                    logAiAction(`Approved AI subtask specs for "${selectedSubtaskForAi.subtask.title}".`);

                    Swal.fire({
                      icon: 'success',
                      title: 'Specifications Saved',
                      text: 'Subtask specs updated successfully!',
                      toast: true,
                      position: 'top-end',
                      showConfirmButton: false,
                      timer: 2000
                    });
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition cursor-pointer"
                >
                  Accept Specifications
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
        .animate-slide-left { animation: slideLeft 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
      </div>
    </>
  );
};

export default ITIssueDetailsPanel;
