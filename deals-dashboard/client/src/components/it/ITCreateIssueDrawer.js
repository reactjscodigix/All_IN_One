import React, { useState, useRef, useEffect } from 'react';
import {
  X, Maximize2, Minus, ChevronDown, 
  Bold, Italic, Link, List, MoreHorizontal,
  Type, Calendar, UploadCloud, Check, HelpCircle,
  Paperclip, Image, Code, CheckSquare, Search, Columns, Clock
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';

const SearchableDropdown = ({ value, options, onSelect, placeholder, labelRenderer, iconRenderer, searchPlaceholder, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt =>
    labelRenderer(opt).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full border border-gray-300 rounded-[3px] px-2.5 py-1.5 bg-white cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
      >
        {value ? (
          <div className="flex items-center gap-2">
            {iconRenderer && iconRenderer(value)}
            <span className="text-[13px] text-gray-900 font-medium">{labelRenderer(value)}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {iconRenderer && iconRenderer(null)}
            <span className="text-[13px] text-gray-500">{placeholder}</span>
          </div>
        )}
        <ChevronDown size={14} className="text-gray-500" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[3px] shadow-lg">
          <div className="p-2 border-b border-gray-100 flex items-center gap-2 text-gray-400 bg-gray-50/50">
            <Search size={12} />
            <input
              autoFocus
              type="text"
              placeholder={searchPlaceholder || "Search..."}
              className="w-full text-[12px] outline-none text-gray-700 bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-48 overflow-y-auto py-1 custom-scrollbar">
            {filteredOptions.length > 0 ? filteredOptions.map((opt, i) => (
              <div
                key={i}
                onClick={() => {
                  onSelect(opt);
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 cursor-pointer"
              >
                {iconRenderer && iconRenderer(opt)}
                <span className="text-[13px] text-gray-700">{labelRenderer(opt)}</span>
                {value && labelRenderer(value) === labelRenderer(opt) && (
                  <Check size={12} className="ml-auto text-blue-600 font-bold" />
                )}
              </div>
            )) : (
              <div className="px-3 py-2 text-[12px] text-gray-500 text-center">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SimpleDropdown = ({ value, options, onSelect, placeholder, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-between border border-gray-300 rounded-[3px] bg-gray-100 px-2.5 py-1 cursor-pointer hover:bg-gray-200 transition-colors min-w-[100px]"
      >
        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">{value || placeholder}</span>
        <ChevronDown size={14} className="text-gray-500 ml-2" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-[3px] shadow-lg py-1">
          {options.map((opt, i) => (
            <div
              key={i}
              onClick={() => {
                onSelect(opt);
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-[12px] font-bold text-gray-700 uppercase"
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ITCreateIssueDrawer = ({ isOpen, onClose, onIssueCreated, projectId }) => {
  const { username } = useParams();
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  
  // Transition and display states
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  // Label tag state
  const [newLabel, setNewLabel] = useState('');
  
  // Attachment state
  const [attachedFiles, setAttachedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Editor Ref
  const editorRef = useRef(null);

  const [formData, setFormData] = useState({
    space: { id: 1, name: 'My Kanban Space (KAN)', code: 'KAN' },
    workType: 'Task',
    status: 'To Do',
    summary: '',
    description: '',
    assignee: null,
    reporter: null,
    parent: null,
    dueDate: '',
    labels: [],
    team: null,
    startDate: '',
    linkedType: 'blocks',
    linkedTarget: null,
    flagged: false,
    createAnother: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImprovingDescription, setIsImprovingDescription] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
      const frame = requestAnimationFrame(() => {
        setAnimateIn(true);
      });
      return () => cancelAnimationFrame(frame);
    } else if (shouldRender) {
      setIsClosing(true);
      setAnimateIn(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
        setIsMaximized(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Mock data fetching for Teams
      setTeams([
        { id: 1, name: 'Frontend Team', icon: 'F' },
        { id: 2, name: 'Backend Team', icon: 'B' },
        { id: 3, name: 'Design Team', icon: 'D' }
      ]);
      
      // Fetch Real Users
      fetch('http://localhost:5000/api/users')
        .then(res => res.json())
        .then(data => {
          if (data && Array.isArray(data.value)) {
            setUsers(data.value);
            // Default reporter
            if (data.value.length > 0 && !formData.reporter) {
              setFormData(prev => ({ ...prev, reporter: data.value[0] }));
            }
          } else if (Array.isArray(data)) {
            setUsers(data);
            if (data.length > 0 && !formData.reporter) {
              setFormData(prev => ({ ...prev, reporter: data[0] }));
            }
          }
        })
        .catch(err => console.error('Error fetching users:', err));

      // Fetch Real Projects (Spaces/Parents)
      fetch('http://localhost:5000/api/projects')
        .then(res => res.json())
        .then(data => {
          if (data && data.data) {
            setProjects(data.data);
          } else if (Array.isArray(data)) {
            setProjects(data);
          }
        })
        .catch(err => console.error('Error fetching projects:', err));
    }
  }, [isOpen]);

  // Set editor content when drawer opens
  useEffect(() => {
    if (isOpen && editorRef.current) {
      editorRef.current.innerHTML = formData.description || "";
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleAssignToMe = () => {
    const searchName = username || 'ashwini';
    const me = users.find(u => 
      (u.first_name && u.first_name.toLowerCase() === searchName.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(searchName.toLowerCase()))
    );
    if (me) {
      setFormData(prev => ({ ...prev, assignee: me }));
    } else if (users.length > 0) {
      setFormData(prev => ({ ...prev, assignee: users[0] }));
    }
  };

  const handleImproveDescription = async () => {
    if (!formData.summary) {
      Swal.fire({
        icon: 'warning',
        title: 'Summary Required',
        text: 'Please enter a summary/title first, as the AI needs it to understand the context of the issue!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }
    setIsImprovingDescription(true);
    try {
      const res = await fetch('http://localhost:5000/api/it-kanban/ai/improve-description-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.summary,
          description: formData.description
        })
      });
      if (!res.ok) throw new Error('Failed to improve description');
      const data = await res.json();
      
      // Update form state
      setFormData(prev => ({ ...prev, description: data.improvedDescription }));
      // Sync editor element
      if (editorRef.current) {
        editorRef.current.innerHTML = data.improvedDescription;
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Description Improved',
        text: 'The description has been enhanced by AI!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to improve description: ' + err.message, 'error');
    } finally {
      setIsImprovingDescription(false);
    }
  };

  const handleAddLabel = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
        setFormData(prev => ({
          ...prev,
          labels: [...prev.labels, newLabel.trim()]
        }));
        setNewLabel('');
      }
    }
  };

  const removeLabel = (labelToRemove) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(l => l !== labelToRemove)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.summary) {
      Swal.fire({ icon: 'warning', title: 'Validation Error', text: 'Summary is required.' });
      return;
    }

    setIsSubmitting(true);
    
    try {
      let res;
      
      if (projectId) {
        // Map Kanban status values to project_tasks schema ENUM values
        const statusMap = {
          'To Do': 'Open',
          'In Progress': 'In Progress',
          'In Review': 'On Hold',
          'Done': 'Completed'
        };
        const mappedStatus = statusMap[formData.status] || 'Open';

        // Create project task
        const projectPayload = {
          title: formData.summary,
          description: formData.description || '',
          status: mappedStatus,
          priority: 'Medium',
          assigned_to: formData.assignee ? formData.assignee.id : null,
          linked_type: 'Project',
          linked_id: parseInt(projectId)
        };
        
        res = await fetch(`http://localhost:5000/api/projects/${projectId}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectPayload)
        });
      } else {
        // Create Kanban issue
        const payload = {
          title: formData.summary,
          type: formData.workType || 'Task',
          status: formData.status ? formData.status.toUpperCase() : 'TO DO',
          assignee: formData.assignee ? (formData.assignee.name || formData.assignee.first_name || 'Unassigned') : 'Unassigned',
          priority: 'Medium',
          description: formData.description || ''
        };

        res = await fetch('http://localhost:5000/api/it-kanban/issues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      
      if (!res.ok) throw new Error('Failed to create issue');
      
      Swal.fire({
        icon: 'success',
        title: 'Ticket Created',
        text: `Task "${formData.summary}" created successfully!`,
        timer: 2000,
        showConfirmButton: false
      });
      
      if (onIssueCreated) onIssueCreated();
      
      if (!formData.createAnother) {
        onClose();
      } else {
        setFormData(prev => ({ ...prev, summary: '', description: '', labels: [] }));
        if (editorRef.current) editorRef.current.innerHTML = "";
        setAttachedFiles([]);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to create issue.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setFormData(prev => ({ ...prev, description: editorRef.current.innerHTML }));
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          animateIn && !isClosing ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      {/* Slide-out Panel / Centered Modal */}
      <div 
        className={`fixed bg-white shadow-2xl z-50 flex flex-col transition-all duration-300 font-sans ${
          isMaximized 
            ? 'inset-0 m-auto w-[90vw] max-w-4xl h-[90vh] max-h-[85vh] rounded-lg' 
            : 'inset-y-0 right-0 w-[600px] border-l border-gray-200'
        } ${
          animateIn && !isClosing 
            ? 'translate-x-0 opacity-100 scale-100' 
            : 'translate-x-full opacity-0 scale-95'
        }`}
      >
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
          <h2 className="text-xl text-gray-800 font-medium tracking-tight">Create Task</h2>
          <div className="flex items-center gap-1 text-gray-500">
            <button type="button" className="p-1.5 hover:bg-gray-100 rounded-md transition-colors" onClick={onClose} title="Minimize"><Minus size={16} /></button>
            <button type="button" className="p-1.5 hover:bg-gray-100 rounded-md transition-colors" onClick={() => setIsMaximized(!isMaximized)} title={isMaximized ? "Shrink to side panel" : "Expand to centered modal"}><Maximize2 size={14} /></button>
            <button type="button" className="p-1.5 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors" onClick={onClose} title="Close"><X size={16} /></button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto px-8 py-5 custom-scrollbar bg-white">
          <p className="text-[12px] text-gray-500 mb-6 font-medium">Required fields are marked with an asterisk <span className="text-red-500">*</span></p>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* Space */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Space <span className="text-red-500">*</span></label>
              <SearchableDropdown
                options={[{ id: 1, name: 'My Kanban Space (KAN)', code: 'KAN' }, ...projects]}
                value={formData.space}
                onSelect={(v) => setFormData({ ...formData, space: v })}
                placeholder="Select space"
                labelRenderer={(p) => p.name}
                iconRenderer={(p) => p ? <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center text-white text-[10px] font-bold">{p.code ? p.code[0] : p.name.charAt(0)}</div> : null}
              />
            </div>

            {/* Work type */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Work type <span className="text-red-500">*</span></label>
              <SearchableDropdown
                options={['Task', 'Story', 'Bug']}
                value={formData.workType}
                onSelect={(v) => setFormData({ ...formData, workType: v })}
                placeholder="Select type"
                labelRenderer={(t) => t}
                iconRenderer={(t) => {
                  if (t === 'Task') return <div className="bg-blue-100 p-0.5 rounded-sm"><CheckSquare size={12} className="text-blue-500" /></div>;
                  if (t === 'Bug') return <div className="w-3.5 h-3.5 bg-red-500 rounded-sm"></div>;
                  if (t === 'Story') return <div className="w-3.5 h-3.5 bg-green-500 rounded-sm"></div>;
                  return null;
                }}
              />
              <div className="flex items-center gap-1 text-[11px] text-blue-600 font-medium cursor-pointer hover:underline mt-1">
                Learn about work types <HelpCircle size={10} />
              </div>
            </div>

            <hr className="border-gray-200" />

            {/* Status */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Status</label>
              <SimpleDropdown
                options={['To Do', 'In Progress', 'In Review', 'Done']}
                value={formData.status}
                onSelect={(v) => setFormData({ ...formData, status: v })}
              />
              <p className="text-[11px] text-gray-500 mt-1">This is the initial status upon creation.</p>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Summary <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={formData.summary}
                onChange={(e) => setFormData({...formData, summary: e.target.value})}
                className={`w-full border rounded-[3px] px-3 py-1.5 text-[14px] text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow ${!formData.summary ? 'border-red-500 bg-red-50/20' : 'border-gray-300'}`}
              />
              {!formData.summary && (
                <div className="text-[11px] text-red-500 mt-1.5 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div> Summary is required
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Description</label>
              <div className="border border-gray-300 rounded-[3px] overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow bg-white">
                
                {/* Rich Text Toolbar */}
                <div className="flex flex-wrap items-center gap-1 p-1 border-b border-gray-200 bg-gray-50/50">
                  <button type="button" className="p-1 hover:bg-gray-200 rounded flex items-center gap-1 text-[12px] font-medium text-gray-600"><span className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 block"></span> <ChevronDown size={12} /></button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button 
                    type="button" 
                    onClick={handleImproveDescription}
                    disabled={isImprovingDescription}
                    className="px-2 py-1 hover:bg-gray-200 rounded text-[12px] text-gray-600 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isImprovingDescription ? 'Improving...' : 'Improve description'} 
                    <span className="text-[10px] text-purple-600 font-bold border border-purple-200 bg-purple-50 px-1 rounded">AI</span>
                  </button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><Type size={14} /></button>
                  <button type="button" onClick={() => handleCommand('bold')} className="p-1 hover:bg-gray-200 rounded text-gray-600 font-bold"><Bold size={14} /></button>
                  <button type="button" onClick={() => handleCommand('italic')} className="p-1 hover:bg-gray-200 rounded text-gray-600 italic"><Italic size={14} /></button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><Columns size={14} /></button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><CheckSquare size={14} /></button>
                  <button type="button" onClick={() => handleCommand('insertUnorderedList')} className="p-1 hover:bg-gray-200 rounded text-gray-600"><List size={14} /></button>
                  <button type="button" onClick={() => handleCommand('formatBlock', '<pre>')} className="p-1 hover:bg-gray-200 rounded text-gray-600 font-serif font-bold text-[12px] px-1.5">&lt;/&gt;</button>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><Image size={14} /></button>
                  <button type="button" className="p-1 hover:bg-gray-200 rounded text-gray-600"><Paperclip size={14} /></button>
                  <button type="button" onClick={() => { const url = prompt('Enter URL:'); if (url) handleCommand('createLink', url); }} className="p-1 hover:bg-gray-200 rounded text-gray-600"><Link size={14} /></button>
                </div>
                
                {/* Editor Area (Visual Rich Text WYSIWYG) */}
                <div 
                  ref={editorRef}
                  contentEditable={true}
                  onInput={(e) => {
                    const newHtml = e.currentTarget.innerHTML;
                    setFormData(prev => ({ ...prev, description: newHtml }));
                  }}
                  className="w-full min-h-[120px] p-3 text-[13px] text-gray-800 outline-none overflow-y-auto rich-editor"
                  placeholder="Pro tip: Type / to add tables, images, code blocks, and more."
                  style={{ minHeight: '120px' }}
                ></div>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-[12px] font-semibold text-gray-700">Assignee</label>
                <button 
                  type="button"
                  onClick={handleAssignToMe}
                  className="text-[12px] text-blue-600 font-medium hover:underline cursor-pointer focus:outline-none"
                >
                  Assign to me
                </button>
              </div>
              <SearchableDropdown
                options={users}
                value={formData.assignee}
                onSelect={(v) => setFormData({ ...formData, assignee: v })}
                placeholder="Automatic"
                labelRenderer={(u) => u.name || `${u.first_name} ${u.last_name}`}
                iconRenderer={(u) => u ? (
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-700 font-bold border border-white shadow-sm overflow-hidden shrink-0">
                    {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : (u.name ? u.name[0] : (u.first_name?.[0] || 'U'))}
                  </div>
                ) : (
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    <Search size={12} />
                  </div>
                )}
              />
            </div>

            {/* Parent */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Parent</label>
              <SearchableDropdown
                options={projects}
                value={formData.parent}
                onSelect={(v) => setFormData({ ...formData, parent: v })}
                placeholder="Select parent"
                labelRenderer={(p) => p.name}
              />
              <p className="text-[11px] text-gray-500 mt-1 leading-tight">Your work type hierarchy determines the work items you can select here.</p>
            </div>

            {/* Due date */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Due date</label>
              <div className="flex items-center justify-between w-64 border border-gray-300 rounded-[3px] px-2.5 py-1.5 bg-white cursor-pointer hover:bg-gray-50 text-gray-500 relative">
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  className="w-full h-full outline-none text-[13px] text-gray-700 bg-transparent"
                />
                <Calendar size={14} className="absolute right-2.5 pointer-events-none text-gray-500" />
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Labels</label>
              <div className="flex flex-wrap gap-2 items-center border border-gray-300 rounded-[3px] px-2.5 py-1.5 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-shadow">
                {formData.labels.map(l => (
                  <span key={l} className="bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 group">
                    {l}
                    <X size={10} className="cursor-pointer text-indigo-400 hover:text-indigo-800" onClick={() => removeLabel(l)} />
                  </span>
                ))}
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={handleAddLabel}
                  placeholder={formData.labels.length === 0 ? "Type and press enter..." : "Add more..."}
                  className="flex-1 min-w-[100px] text-[13px] outline-none border-none bg-transparent"
                />
              </div>
            </div>

            {/* Team */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Team</label>
              <SearchableDropdown
                options={teams}
                value={formData.team}
                onSelect={(v) => setFormData({ ...formData, team: v })}
                placeholder="Choose a team"
                labelRenderer={(t) => t.name}
                iconRenderer={(t) => t ? (
                  <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center text-blue-700 font-bold text-[10px]">
                    {t.icon}
                  </div>
                ) : (
                  <div className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-gray-500 border border-gray-200">
                    <Search size={10} />
                  </div>
                )}
              />
              <p className="text-[11px] text-gray-500 mt-1 leading-tight">Associates a team to an issue. You can use this field to search and filter issues by team.</p>
            </div>

            {/* Start date */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Start date</label>
              <div className="flex items-center justify-between w-64 border border-gray-300 rounded-[3px] px-2.5 py-1.5 bg-white cursor-pointer hover:bg-gray-50 text-gray-500 relative">
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full h-full outline-none text-[13px] text-gray-700 bg-transparent"
                />
                <Calendar size={14} className="absolute right-2.5 pointer-events-none text-gray-500" />
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-tight">Allows the planned start date for a piece of work to be set.</p>
            </div>

            {/* Reporter */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Reporter <span className="text-red-500">*</span></label>
              <SearchableDropdown
                options={users}
                value={formData.reporter}
                onSelect={(v) => setFormData({ ...formData, reporter: v })}
                placeholder="Select reporter"
                labelRenderer={(u) => u.name || `${u.first_name} ${u.last_name}`}
                iconRenderer={(u) => u ? (
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-700 font-bold border border-white shadow-sm overflow-hidden shrink-0 mr-2">
                    {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : (u.name ? u.name[0] : (u.first_name?.[0] || 'U'))}
                  </div>
                ) : null}
              />
            </div>

            {/* Attachment */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Attachment</label>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => {
                  if (e.target.files.length > 0) {
                    const newFiles = Array.from(e.target.files).map(f => f.name);
                    setAttachedFiles(prev => [...prev, ...newFiles]);
                  }
                }}
                multiple
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-[3px] p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition cursor-pointer gap-2 group"
              >
                <UploadCloud size={24} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                <div className="text-[13px] text-gray-600">
                  Drop files to attach or <span className="text-gray-900 bg-gray-100 border border-gray-300 rounded-[3px] px-2 py-0.5 ml-1 shadow-sm font-medium">Browse</span>
                </div>
              </div>
              
              {/* Attached file list */}
              {attachedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {attachedFiles.map((name, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-gray-50 border border-gray-200 px-2.5 py-1 rounded">
                      <span className="text-gray-700 truncate">{name}</span>
                      <X size={12} className="text-gray-400 hover:text-red-500 cursor-pointer" onClick={(e) => { e.stopPropagation(); setAttachedFiles(prev => prev.filter((_, idx) => idx !== i)); }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Linked work items */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Linked work items</label>
              <div className="flex gap-2">
                <div className="w-1/3">
                  <SearchableDropdown
                    options={['blocks', 'is blocked by', 'clones', 'is cloned by', 'duplicates', 'is duplicated by', 'relates to']}
                    value={formData.linkedType}
                    onSelect={(v) => setFormData({ ...formData, linkedType: v })}
                    placeholder="Select type"
                    labelRenderer={(t) => t}
                  />
                </div>
                <div className="w-2/3">
                  <SearchableDropdown
                    options={projects} 
                    value={formData.linkedTarget}
                    onSelect={(v) => setFormData({ ...formData, linkedTarget: v })}
                    placeholder="Type, search or paste URL"
                    labelRenderer={(p) => p.name}
                  />
                </div>
              </div>
            </div>

            {/* Flagged */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-700 mb-1.5">Flagged</label>
              <div className="flex items-center gap-2 mb-1 cursor-pointer" onClick={(e) => { e.preventDefault(); setFormData({...formData, flagged: !formData.flagged}); }}>
                <input 
                  type="checkbox" 
                  checked={formData.flagged}
                  onChange={(e) => setFormData({...formData, flagged: e.target.checked})}
                  className="w-3.5 h-3.5 text-blue-600 rounded-[2px] border-gray-300 focus:ring-blue-500 focus:ring-offset-0 focus:ring-1 cursor-pointer pointer-events-none"
                />
                <span className="text-[13px] text-gray-900 select-none">Impediment</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-tight">Allows to flag issues with impediments.</p>
            </div>

          </form>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-white rounded-b-lg">
          <div className="flex items-center gap-2 cursor-pointer" onClick={(e) => { e.preventDefault(); setFormData({...formData, createAnother: !formData.createAnother}); }}>
            <input 
              type="checkbox" 
              checked={formData.createAnother}
              onChange={(e) => setFormData({...formData, createAnother: e.target.checked})}
              className="w-3.5 h-3.5 text-blue-600 rounded-[2px] border-gray-300 focus:ring-blue-500 focus:ring-offset-0 focus:ring-1 cursor-pointer pointer-events-none"
            />
            <span className="text-[13px] text-gray-700 font-medium select-none">Create Another</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="text-[14px] font-medium text-gray-700 hover:bg-gray-100 rounded px-3 py-1.5 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-4 py-1.5 rounded-[3px] text-[14px] font-medium transition-colors flex items-center justify-center ${!formData.summary || isSubmitting ? 'bg-blue-600/50 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              {isSubmitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .rich-editor[contenteditable]:empty:before {
          content: attr(placeholder);
          color: #9ca3af;
          font-style: italic;
          cursor: text;
        }
      `}</style>
    </>
  );
};

export default ITCreateIssueDrawer;
