import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { ArrowUp, ArrowDown, CheckSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/environment';

import ITIssueHeaderBar from './issue-details/ITIssueHeaderBar';
import ITIssueDescription from './issue-details/ITIssueDescription';
import ITSubtasksTable from './issue-details/ITSubtasksTable';
import ITIssueLinkedItems from './issue-details/ITIssueLinkedItems';
import ITIssueActivityTabs from './issue-details/ITIssueActivityTabs';
import ITIssueDetailsSidebar from './issue-details/ITIssueDetailsSidebar';
import ITSubtaskAiModal from './issue-details/ITSubtaskAiModal';

const PRIORITY_ICONS = {
  Highest: <ArrowUp size={14} className="text-red-600 font-bold" />,
  High: <ArrowUp size={14} className="text-red-500" />,
  Medium: <span className="text-orange-500 font-bold text-xs leading-none flex items-center justify-center font-sans">=</span >,
  Low: <ArrowDown size={14} className="text-blue-500" />,
  Lowest: <ArrowDown size={14} className="text-blue-400 opacity-75" />,
  'Not Decided': <span className="text-gray-400 font-bold text-xs font-mono">-</span>,
  None: <span className="text-gray-400 font-bold text-xs font-mono">-</span>
};

const TYPE_ICONS = {
  Task: <CheckSquare size={14} className="text-blue-500 fill-blue-100" />,
  Story: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-green-500 fill-green-100" fill="currentColor"><path d="M5 3v18l7-4.5 7 4.5V3z" /></svg>,
  Bug: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-red-500 fill-red-100" fill="currentColor"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8" cy="8" r="1.5" /><circle cx="16" cy="8" r="1.5" /><circle cx="8" cy="16" r="1.5" /><circle cx="16" cy="16" r="1.5" /></svg>,
  Test: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-purple-500 fill-purple-100" fill="currentColor"><rect x="9" y="3" width="6" height="3" rx="1" /><path d="M10 6v11a2 2 0 004 0V6" /></svg>
};

const getInitials = (name) => {
  if (!name || name === 'Unassigned') return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const SPRINTS = ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Backlog'];

const DEFAULT_USERS = [
  { id: 1, name: 'Purvesh Patil' },
  { id: 2, name: 'Ashwini Khedekar' },
  { id: 3, name: 'Sudarshan Kale' },
  { id: 4, name: 'Olivia Taylor' },
  { id: 5, name: 'Super Admin' }
];

const STATUS_COLORS = {
  'TO DO': 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  'IN PROGRESS': 'bg-blue-100 text-blue-800 hover:bg-blue-200 font-semibold',
  'IN REVIEW': 'bg-purple-100 text-purple-800 hover:bg-purple-200 font-semibold',
  'DONE': 'bg-green-100 text-green-800 hover:bg-green-200 font-semibold'
};

const ITIssueDetailsPanel = ({ issue, updateIssue, deleteIssue, onClose, onIssueCreated }) => {
  const { user } = useAuth();
  const loggedUser = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : 'Current User';

  // Core issue state
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Task');
  const [currentStatus, setCurrentStatus] = useState('TO DO');
  const [priority, setPriority] = useState('Medium');
  const [assignee, setAssignee] = useState({ name: 'Unassigned', initial: 'U', color: 'bg-gray-200 text-gray-500' });
  const [reporter, setReporter] = useState({ name: loggedUser, initial: getInitials(loggedUser), color: 'bg-blue-100 text-blue-700' });
  const [team, setTeam] = useState('IT Team');
  const [dueDate, setDueDate] = useState('');
  const [sprint, setSprint] = useState('Sprint 1');
  const [originalEstimate, setOriginalEstimate] = useState('0h');
  const [remainingEstimate, setRemainingEstimate] = useState('0h');

  // Descriptions & Subtasks
  const [description, setDescription] = useState('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);

  // AI & Docs States
  const [improvedDescription, setImprovedDescription] = useState('');
  const [isImprovingSideBySide, setIsImprovingSideBySide] = useState(false);
  const [detailedSuggestedSubtasks, setDetailedSuggestedSubtasks] = useState([]);
  const [showSuggestedSubtasksCard, setShowSuggestedSubtasksCard] = useState(false);
  const [selectedSubtaskForAi, setSelectedSubtaskForAi] = useState(null);
  const [subtaskAiDetails, setSubtaskAiDetails] = useState(null);
  const [showSubtaskAiModal, setShowSubtaskAiModal] = useState(false);
  const [aiLoading, setAiLoading] = useState({ description: false, subtasks: false });

  // Linked items & Comments
  const [linkedIssues, setLinkedIssues] = useState([]);
  const [isLinkingIssue, setIsLinkingIssue] = useState(false);
  const [linkRelation, setLinkRelation] = useState('is blocked by');
  const [linkSearchInput, setLinkSearchInput] = useState('');
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  // Layout UI states
  const [currentSubtask, setCurrentSubtask] = useState(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isWatching, setIsWatching] = useState(true);
  const [watchCount, setWatchCount] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('Comments');
  const [collapsedSections, setCollapsedSections] = useState({ details: false, development: false, automation: false });
  const [usersList, setUsersList] = useState(DEFAULT_USERS);
  const [teamsList, setTeamsList] = useState([]);
  const [duplicateWarning, setDuplicateWarning] = useState([]);
  const [docsData, setDocsData] = useState(null);

  const fileInputRef = useRef(null);
  const commentInputRef = useRef(null);

  // Load team users & issue details on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/users`)
      .then(res => res.json())
      .then(data => {
        const raw = Array.isArray(data?.value) ? data.value : (Array.isArray(data) ? data : []);
        if (raw.length > 0) {
          const formatted = raw.map(u => ({
            id: u.id,
            name: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || 'User'
          }));
          setUsersList(formatted);
        } else {
          setUsersList(DEFAULT_USERS);
        }
      })
      .catch(err => {
        console.error('Error fetching users:', err);
        setUsersList(DEFAULT_USERS);
      });

    fetch(`${API_BASE_URL}/teams`)
      .then(res => res.json())
      .then(data => Array.isArray(data) && setTeamsList(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!issue) return;
    setCurrentSubtask(null);
    setTitle(issue.title || '');
    setType(issue.type || 'Task');
    setCurrentStatus(issue.status || 'TO DO');
    setPriority(issue.priority || 'Medium');
    setDescription(issue.description || '');

    const ass = issue.assignee || 'Unassigned';
    setAssignee({ name: ass, initial: getInitials(ass), color: ass === 'Unassigned' ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white' });

    const rep = issue.reporter || loggedUser;
    setReporter({ name: rep, initial: getInitials(rep), color: 'bg-blue-100 text-blue-700' });

    let rawSt = issue.subtasks;
    if (typeof rawSt === 'string') {
      try { rawSt = JSON.parse(rawSt); } catch (e) { rawSt = []; }
    }
    const parsedList = Array.isArray(rawSt) ? rawSt : [];
    const parentTitleStr = issue.title || '';
    const sanitizedList = parsedList.map(st => {
      let cleanTitle = st.title || '';
      if (cleanTitle.includes('...')) {
        if (cleanTitle.includes('title:')) {
          cleanTitle = cleanTitle.replace(/title:\s*.*$/, `title: "${parentTitleStr}"`);
        } else if (parentTitleStr) {
          cleanTitle = cleanTitle.replace(/\.\.\./g, ` (${parentTitleStr})`);
        } else {
          cleanTitle = cleanTitle.replace(/\.\.\./g, '');
        }
      }
      return {
        ...st,
        title: cleanTitle.trim(),
        assignee: (!st.assignee || st.assignee === 'Unassigned' || st.assignee.includes('Manager') || st.assignee.includes('Admin')) ? 'Unassigned' : st.assignee
      };
    });
    setSubtasks(sanitizedList);
    setTeam(issue.team || 'IT Team');
  }, [issue]);

  // Filter user list to ONLY show team members of the current task's team
  useEffect(() => {
    if (!team && !issue?.team_id) return;
    const targetTeam = teamsList.find(t => t.name === team || t.id === issue?.team_id);
    if (targetTeam && targetTeam.id) {
      fetch(`${API_BASE_URL}/teams/${targetTeam.id}/members`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const teamUsers = data.map(m => ({
              id: m.user_id || m.id,
              name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.email || 'Team Member'
            }));
            setUsersList(teamUsers);
          }
        })
        .catch(console.error);
    }
  }, [team, teamsList, issue]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.interactive-dropdown')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleUpdate = (updatedFields) => {
    const issueKey = issue?.issue_key || issue?.key;
    if (!issueKey || !updateIssue) return;
    updateIssue(issueKey, updatedFields);
  };

  const toggleDropdown = (name) => {
    setOpenDropdown(prev => prev === name ? null : name);
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleWatchToggle = () => {
    setIsWatching(!isWatching);
    setWatchCount(prev => isWatching ? prev - 1 : prev + 1);
  };

  const handleAssignToMe = () => {
    const me = loggedUser;
    const newAss = { name: me, initial: getInitials(me), color: 'bg-blue-600 text-white' };
    setAssignee(newAss);
    handleUpdate({ assignee: me });
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    const newSubtasks = [...subtasks, {
      id: Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false,
      status: 'To Do',
      priority: 'Medium',
      assignee: 'Unassigned'
    }];
    setSubtasks(newSubtasks);
    setNewSubtaskTitle('');
    setIsAddingSubtask(false);
    handleUpdate({ subtasks: newSubtasks });
  };

  const handleDetailedSubtaskSuggest = async () => {
    setOpenDropdown(null);
    setAiLoading(prev => ({ ...prev, subtasks: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/it-kanban/issues/${issue.issue_key || issue.key}/ai/generate-subtasks-detailed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      if (!res.ok) throw new Error('Failed to generate detailed subtasks');
      const data = await res.json();
      const generatedList = Array.isArray(data.subtasks) ? data.subtasks : [];

      if (generatedList.length > 0) {
        const newEntries = generatedList.map((st, i) => ({
          id: Date.now() + i,
          title: st.title,
          completed: false,
          status: 'To Do',
          priority: st.priority || 'Medium',
          assignee: 'Unassigned'
        }));
        const newSubtasks = [...subtasks, ...newEntries];
        setSubtasks(newSubtasks);
        setIsAddingSubtask(false);
        handleUpdate({ subtasks: newSubtasks });

        Swal.fire({
          icon: 'success',
          title: '✨ AI Subtasks Created!',
          text: `Added ${newEntries.length} technical subtasks to this issue.`,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setAiLoading(prev => ({ ...prev, subtasks: false }));
    }
  };

  const deleteSubtask = (id) => {
    const updated = subtasks.filter(st => st.id !== id);
    setSubtasks(updated);
    handleUpdate({ subtasks: updated });
  };

  const handleSubtaskAiImprove = async (subtask, index) => {
    try {
      const res = await fetch(`${API_BASE_URL}/it-kanban/issues/${issue.issue_key || issue.key}/ai/subtask-specs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subtaskTitle: subtask.title, parentTitle: title })
      });
      if (!res.ok) throw new Error('Failed to fetch AI specs');
      const data = await res.json();
      setSubtaskAiDetails(data.specs);
      setSelectedSubtaskForAi({ subtask, index });
      setShowSubtaskAiModal(true);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const handleImproveDescription = async () => {
    setAiLoading(prev => ({ ...prev, description: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/it-kanban/issues/${issue.issue_key || issue.key}/ai/improve-description`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to improve description');
      const data = await res.json();
      setImprovedDescription(data.improvedDescription);
      setIsImprovingSideBySide(true);
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setAiLoading(prev => ({ ...prev, description: false }));
    }
  };

  const handleSaveDescription = () => {
    setDescription(tempDescription);
    setIsEditingDescription(false);
    handleUpdate({ description: tempDescription });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAtts = files.map(f => ({ name: f.name, size: `${Math.round(f.size / 1024)} KB`, url: URL.createObjectURL(f) }));
    setAttachments(prev => [...prev, ...newAtts]);
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreateLinkedIssue = () => {
    if (!linkSearchInput.trim()) return;
    setLinkedIssues(prev => [...prev, { relation: linkRelation, key: linkSearchInput, title: `Related task (${linkSearchInput})` }]);
    setLinkSearchInput('');
    setIsLinkingIssue(false);
  };

  const deleteLinkedIssue = (key) => {
    setLinkedIssues(prev => prev.filter(l => l.key !== key));
  };

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;
    setComments(prev => [...prev, { author: loggedUser, text: newCommentText.trim(), time: 'Just now' }]);
    setNewCommentText('');
    setIsCommenting(false);
  };

  const deleteComment = (idx) => {
    setComments(prev => prev.filter((_, i) => i !== idx));
  };

  if (!issue) return null;

  return (
    <>
      {/* Backdrop for Expanded Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Main Drawer Container */}
      <div
        className={
          isExpanded
            ? "fixed inset-4 md:inset-8 bg-white rounded-xl border border-gray-200 shadow-2xl z-[9999] flex flex-col font-sans text-gray-800 overflow-hidden animate-fade-in"
            : "fixed right-0 top-0 bottom-0 w-[940px] max-w-[94vw] border-l border-gray-200 bg-white flex flex-col shadow-2xl z-[9999] animate-slide-left font-sans text-gray-800"
        }
      >
        {/* HEADER BAR */}
        <ITIssueHeaderBar
          issue={issue}
          type={currentSubtask ? 'Task' : type}
          TYPE_ICONS={TYPE_ICONS}
          isWatching={isWatching}
          watchCount={watchCount}
          handleWatchToggle={handleWatchToggle}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          onClose={onClose}
          deleteIssue={deleteIssue}
          openDropdown={openDropdown}
          toggleDropdown={toggleDropdown}
          currentSubtask={currentSubtask}
          onBackToParent={() => setCurrentSubtask(null)}
        />

        {/* INDEPENDENTLY SCROLLABLE 2-COLUMN JIRA CONTENT */}
        <div className="flex-1 min-h-0 p-5 flex gap-6 overflow-hidden">
          {/* Left Column (Main Content - Independent Scroll) */}
          <div className="flex-1 min-w-0 overflow-y-auto pr-3 custom-scrollbar space-y-6">
            {/* Title (Interactive, Full Wrapping & Inline Editable like Jira) */}
            <div className="group relative">
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <textarea
                    autoFocus
                    value={currentSubtask ? currentSubtask.title : title}
                    onChange={(e) => {
                      const newT = e.target.value;
                      if (currentSubtask) {
                        setCurrentSubtask(prev => ({ ...prev, title: newT }));
                        const updatedSubtasks = subtasks.map(item =>
                          item.id === currentSubtask.id ? { ...item, title: newT } : item
                        );
                        setSubtasks(updatedSubtasks);
                        handleUpdate({ subtasks: updatedSubtasks });
                      } else {
                        setTitle(newT);
                      }
                    }}
                    onBlur={() => {
                      setIsEditingTitle(false);
                      if (!currentSubtask) handleUpdate({ title });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        setIsEditingTitle(false);
                        if (!currentSubtask) handleUpdate({ title });
                      }
                    }}
                    className="w-full text-xl font-bold text-gray-900 border border-blue-500 rounded p-2 outline-none resize-none leading-snug"
                    rows={2}
                  />
                </div>
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className="text-xl font-bold text-gray-900 leading-snug hover:bg-gray-100 p-1 -ml-1 rounded cursor-pointer transition break-words"
                  title="Click to edit title"
                >
                  {currentSubtask ? currentSubtask.title : title}
                </h2>
              )}
            </div>

            {/* Description & Attachments */}
            <ITIssueDescription
              issue={currentSubtask ? { ...issue, title: currentSubtask.title } : issue}
              description={currentSubtask ? (currentSubtask.description || '') : description}
              setDescription={(newDesc) => {
                if (currentSubtask) {
                  setCurrentSubtask(prev => ({ ...prev, description: newDesc }));
                  const updatedSubtasks = subtasks.map(item =>
                    item.id === currentSubtask.id ? { ...item, description: newDesc } : item
                  );
                  setSubtasks(updatedSubtasks);
                  handleUpdate({ subtasks: updatedSubtasks });
                } else {
                  setDescription(newDesc);
                }
              }}
              isEditingDescription={isEditingDescription}
              setIsEditingDescription={setIsEditingDescription}
              tempDescription={tempDescription}
              setTempDescription={setTempDescription}
              handleSaveDescription={() => {
                if (currentSubtask) {
                  const updatedSubtasks = subtasks.map(item =>
                    item.id === currentSubtask.id ? { ...item, description: tempDescription } : item
                  );
                  setSubtasks(updatedSubtasks);
                  setCurrentSubtask(prev => ({ ...prev, description: tempDescription }));
                  setIsEditingDescription(false);
                  handleUpdate({ subtasks: updatedSubtasks });
                } else {
                  handleSaveDescription();
                }
              }}
              handleImproveDescription={handleImproveDescription}
              aiLoading={aiLoading}
              isImprovingSideBySide={isImprovingSideBySide}
              setIsImprovingSideBySide={setIsImprovingSideBySide}
              improvedDescription={improvedDescription}
              setImprovedDescription={setImprovedDescription}
              attachments={attachments}
              handleFileUpload={handleFileUpload}
              handleRemoveAttachment={handleRemoveAttachment}
              selectedPdfUrl={selectedPdfUrl}
              setSelectedPdfUrl={setSelectedPdfUrl}
              fileInputRef={fileInputRef}
              handleUpdate={handleUpdate}
            />

            {/* Jira Subtasks Data Table & Quick Creator (Visible on Parent Issue) */}
            {!currentSubtask && (
              <ITSubtasksTable
                issue={issue}
                subtasks={subtasks}
                setSubtasks={setSubtasks}
                isAddingSubtask={isAddingSubtask}
                setIsAddingSubtask={setIsAddingSubtask}
                newSubtaskTitle={newSubtaskTitle}
                setNewSubtaskTitle={setNewSubtaskTitle}
                handleAddSubtask={handleAddSubtask}
                handleDetailedSubtaskSuggest={handleDetailedSubtaskSuggest}
                handleSubtaskAiImprove={handleSubtaskAiImprove}
                deleteSubtask={deleteSubtask}
                handleUpdate={handleUpdate}
                aiLoading={aiLoading}
                getInitials={getInitials}
                PRIORITY_ICONS={PRIORITY_ICONS}
                usersList={usersList}
                onSelectSubtask={(st, subtaskKey) => setCurrentSubtask({ ...st, subtaskKey })}
              />
            )}

            {/* Linked Work Items */}
            <ITIssueLinkedItems
              linkedIssues={linkedIssues}
              isLinkingIssue={isLinkingIssue}
              setIsLinkingIssue={setIsLinkingIssue}
              linkRelation={linkRelation}
              setLinkRelation={setLinkRelation}
              linkSearchInput={linkSearchInput}
              setLinkSearchInput={setLinkSearchInput}
              handleCreateLinkedIssue={handleCreateLinkedIssue}
              deleteLinkedIssue={deleteLinkedIssue}
            />

            {/* Activity Tabs, Comments & AI Docs */}
            <ITIssueActivityTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              comments={comments}
              newCommentText={newCommentText}
              setNewCommentText={setNewCommentText}
              isCommenting={isCommenting}
              setIsCommenting={setIsCommenting}
              handleAddComment={handleAddComment}
              deleteComment={deleteComment}
              commentInputRef={commentInputRef}
              docsData={docsData}
            />
          </div>

          {/* Right Column (Jira Details Sidebar) */}
          <ITIssueDetailsSidebar
            currentStatus={currentSubtask ? (currentSubtask.status || 'To Do') : currentStatus}
            setCurrentStatus={(st) => {
              if (currentSubtask) {
                const newStStatus = st;
                setCurrentSubtask(prev => ({ ...prev, status: newStStatus }));
                const updatedSubtasks = subtasks.map(item =>
                  item.id === currentSubtask.id
                    ? { ...item, status: newStStatus, completed: newStStatus === 'Done' }
                    : item
                );
                setSubtasks(updatedSubtasks);
                handleUpdate({ subtasks: updatedSubtasks });
              } else {
                setCurrentStatus(st);
              }
            }}
            STATUS_COLORS={STATUS_COLORS}
            openDropdown={openDropdown}
            toggleDropdown={toggleDropdown}
            setOpenDropdown={setOpenDropdown}
            aiLoading={aiLoading}
            handleSideBySideImprove={handleImproveDescription}
            handleLinkConfluence={() => { }}
            handleSummarizeComments={() => { }}
            handleDetailedSubtaskSuggest={handleDetailedSubtaskSuggest}
            handleLinkSimilar={() => { }}
            collapsedSections={collapsedSections}
            toggleSection={toggleSection}
            assignee={currentSubtask ? { name: currentSubtask.assignee || 'Unassigned', initial: getInitials(currentSubtask.assignee), color: 'bg-blue-100 text-blue-700' } : assignee}
            setAssignee={(newAss) => {
              if (currentSubtask) {
                const assName = typeof newAss === 'string' ? newAss : (newAss.name || 'Unassigned');
                setCurrentSubtask(prev => ({ ...prev, assignee: assName }));
                const updatedSubtasks = subtasks.map(item =>
                  item.id === currentSubtask.id
                    ? { ...item, assignee: assName }
                    : item
                );
                setSubtasks(updatedSubtasks);
                handleUpdate({ subtasks: updatedSubtasks });
              } else {
                setAssignee(newAss);
              }
            }}
            reporter={reporter}
            setReporter={setReporter}
            team={team}
            setTeam={setTeam}
            dueDate={dueDate}
            setDueDate={setDueDate}
            sprint={sprint}
            setSprint={setSprint}
            originalEstimate={originalEstimate}
            setOriginalEstimate={setOriginalEstimate}
            remainingEstimate={remainingEstimate}
            setRemainingEstimate={setRemainingEstimate}
            usersList={usersList}
            teamsList={teamsList}
            SPRINTS={SPRINTS}
            handleUpdate={handleUpdate}
            handleAssignToMe={handleAssignToMe}
            currentSubtask={currentSubtask}
            parentIssueKey={issue?.issue_key || issue?.key}
            parentIssueTitle={issue?.title}
            onBackToParent={() => setCurrentSubtask(null)}
            issue={issue}
          />
        </div>

        {/* NESTED SUBTASK AI SPECIFICATIONS MODAL */}
        <ITSubtaskAiModal
          showSubtaskAiModal={showSubtaskAiModal}
          setShowSubtaskAiModal={setShowSubtaskAiModal}
          subtaskAiDetails={subtaskAiDetails}
          selectedSubtaskForAi={selectedSubtaskForAi}
          subtasks={subtasks}
          setSubtasks={setSubtasks}
          handleUpdate={handleUpdate}
          logAiAction={() => { }}
        />
      </div>

      <style>{`
        .animate-slide-left { animation: slideLeft 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
        @keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </>
  );
};

export default ITIssueDetailsPanel;
