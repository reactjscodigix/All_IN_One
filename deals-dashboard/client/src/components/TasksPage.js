import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, Plus, Search, Filter, Star, Calendar, Trash2, Edit2, Eye, Clock, User as UserIcon, Layout as LayoutIcon, List, Trello, Building2, Phone, MessageSquare } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import AddNewTaskModal from './AddNewTaskModal';
import AddNewLeadModal from './AddNewLeadModal';
import DataTable from './DataTable';
import AdvancedFilterDropdown from './AdvancedFilterDropdown';
import AdvancedDateRangePicker from './AdvancedDateRangePicker';
import SortByDropdown from './SortByDropdown';
import ManageColumnsDropdown from './ManageColumnsDropdown';
import { useAuth } from '../hooks/useAuth';
import { leadsAPI, taskAPI } from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const getPriorityBadgeColor = (priority) => {
  const colors = {
    'Critical': 'bg-red-100 text-red-700',
    'High': 'bg-orange-100 text-orange-700',
    'Medium': 'bg-yellow-100 text-yellow-700',
    'Low': 'bg-green-100 text-green-700'
  };
  return colors[priority] || colors.Medium;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Today';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateString;
  }
};

const parseJsonSafe = (data, defaultValue = []) => {
  if (!data) return defaultValue;
  if (typeof data !== 'string') return Array.isArray(data) ? data : defaultValue;
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const TaskCard = ({ 
  task, 
  getPriorityBadgeColor, 
  formatDate, 
  leads, 
  deals, 
  projects, 
  quotations,
  handleStatusChange, 
  handleSyncKanbanStatus,
  handleDeleteTask,
  openMenuId,
  setOpenMenuId,
  isKanban = false
}) => {
  const navigate = useNavigate();

  const getEntityInfo = () => {
    let title = task.title;
    let icon1 = <Building2 size={14} />;
    let sub1 = '-';
    let icon2 = <UserIcon size={14} />;
    let sub2 = '-';
    let icon3 = <Filter size={14} />;
    let sub3 = task.linked_type || 'General';

    if (task.linked_type === 'Lead') {
      const lead = leads.find(l => l.id === parseInt(task.linked_id));
      if (lead) {
        title = lead.lead_name || task.title;
        sub1 = lead.project_name || lead.company || '-';
        sub2 = lead.email || 'Lead';
        sub3 = 'Lead';
      }
    } else if (task.linked_type === 'Deal') {
      const deal = deals.find(d => d.id === parseInt(task.linked_id));
      if (deal) {
        title = deal.deal_name;
        sub1 = deal.company_name || '-';
        sub2 = deal.deal_stage || 'Deal';
        sub3 = 'Deal';
      }
    } else if (task.linked_type === 'Project') {
      const project = projects.find(p => p.id === parseInt(task.linked_id));
      if (project) {
        title = project.name;
        sub1 = project.client_name || '-';
        sub2 = project.status || 'Project';
        sub3 = 'Project';
      }
    } else if (task.linked_type === 'Quotation') {
      const quotation = quotations.find(q => q.id === parseInt(task.linked_id));
      if (quotation) {
        title = quotation.subject;
        sub1 = quotation.client_name || '-';
        sub2 = quotation.status || 'Quotation';
        sub3 = 'Quotation';
      }
    }

    return { title, icon1, sub1, icon2, sub2, icon3, sub3 };
  };

  const info = getEntityInfo();

  return (
    <div 
      onClick={() => navigate(`/task/${task.id}`)}
      className={`bg-white p-2 rounded border border-gray-100  transition-all cursor-pointer relative group ${isKanban ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-[500] text-black truncate pr-8" title={info.title}>
          {info.title}
        </h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === task.id ? null : task.id);
            }}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <MoreVertical size={15} />
          </button>
          {openMenuId === task.id && (
            <div className="absolute right-2 top-10 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[150px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(task.id, 'In Progress');
                }}
                className="w-full px-3 py-2 text-left text-[10px] hover:bg-gray-50 border-b"
              >
                Start Task
              </button>
              {(task.linked_type === 'Project' || task.linked_type === 'Deal') && task.linked_id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSyncKanbanStatus(task.id);
                  }}
                  className="w-full px-3 py-2 text-left text-[10px] text-blue-600 hover:bg-blue-50 border-b"
                >
                  Sync Kanban Status
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(task.id, 'Completed');
                }}
                className="w-full px-3 py-2 text-left text-[10px] text-green-600 hover:bg-green-50"
              >
                Mark Completed
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTask(task.id);
                }}
                className="w-full px-3 py-2 text-left text-[10px] text-red-600 hover:bg-red-50 border-t"
              >
                Delete Task
              </button>
            </div>
          )}
        </div>
      </div>

      <div className=" mb-2">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <div className="w-5 flex justify-center">
            {info.icon1}
          </div>
          <span className="truncate ">{info.sub1}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-400">
          <div className="w-5 flex justify-center">
            {info.icon2}
          </div>
          <span className="truncate ">{info.sub2}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-400">
          <div className="w-5 flex justify-center">
            {info.icon3}
          </div>
          <span className=" bg-gray-50 text-gray-500  text-[11px] font-[500] ">
            {info.sub3}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-50 ">
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-gray-400 text-xs">Task Type:</span>
          <span className="font-[500] text-black flex items-center gap-1">
            {task.task_type === 'Call' && <Phone size={12} className="text-teal-500" />}
            {task.task_type === 'Message' && <MessageSquare size={12} className="text-blue-500" />}
            {task.task_type === 'WhatsApp' && <MessageSquare size={12} className="text-green-500" />}
            {task.task_type === 'Google Meet' && <Calendar size={12} className="text-orange-500" />}
            {task.task_type === 'Zoom Meeting' && <Calendar size={12} className="text-blue-500" />}
            {task.task_type || 'General'}
          </span>
        </div>
        <div className="flex justify-between items-center text-[13px]">
          <span className="text-gray-400 text-xs ">Next Followup:</span>
          <div className="flex flex-col items-end">
            <span className="font-[500] text-black">{formatDate(task.next_followup_date || task.due_date)}</span>
            {task.due_time && (
              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                <Clock size={10} /> {task.due_time}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-8">
         <span className={`px-2 py-0.5 rounded text-[10px] font-[500]  tracking-wider ${getPriorityBadgeColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>
    </div>
  );
};

const TasksPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('All Tasks');
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [deals, setDeals] = useState([]);
  const [projects, setProjects] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [leadToEdit, setLeadToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [starredTasks, setStarredTasks] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedFilters, setSelectedFilters] = useState({});
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [visibleColumns, setVisibleColumns] = useState([]);
  const [viewMode, setViewMode] = useState('list');

  const handleStatusChange = useCallback(async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, status: newStatus };
    setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });

      // If task is linked to a project, update project status too
      if (task.linked_type === 'Project' && task.linked_id) {
        const projectId = parseInt(task.linked_id);
        const project = projects.find(p => p.id === projectId);
        if (project) {
          const projectUpdate = { ...project, status: newStatus };
          await fetch(`${apiUrl}/projects/${projectId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectUpdate),
          });
          setProjects(prev => prev.map(p => p.id === projectId ? projectUpdate : p));
        }
      }

      // If task is linked to a deal, update deal stage too
      if (task.linked_type === 'Deal' && task.linked_id) {
        const dealId = parseInt(task.linked_id);
        const deal = deals.find(d => d.id === dealId);
        if (deal) {
          const dealUpdate = { ...deal, deal_stage: newStatus };
          await fetch(`${apiUrl}/deals/${dealId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dealUpdate),
          });
          setDeals(prev => prev.map(d => d.id === dealId ? dealUpdate : d));
        }
      }

      // If task is linked to a lead, update lead status too
      if (task.linked_type === 'Lead' && task.linked_id) {
        const leadId = parseInt(task.linked_id);
        const lead = leads.find(l => l.id === leadId);
        if (lead) {
          const leadUpdate = { ...lead, status: newStatus };
          await fetch(`${apiUrl}/leads/${leadId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(leadUpdate),
          });
          setLeads(prev => prev.map(l => l.id === leadId ? leadUpdate : l));
        }
      }
    } catch (err) {
      console.error('Error updating task/project:', err);
      loadTasks();
    }
    setOpenMenuId(null);
  }, [tasks, projects, deals, leads]);

  const handleSyncKanbanStatus = useCallback(async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (task.linked_type === 'Project' && task.linked_id) {
      const projectId = parseInt(task.linked_id);
      const project = projects.find(p => p.id === projectId);
      
      if (project && project.status !== task.status) {
        if (window.confirm(`Sync Task status with Project Kanban status (${project.status})?`)) {
          await handleStatusChange(taskId, project.status);
        }
      } else if (!project) {
        alert('Linked project not found in current view.');
      } else {
        alert('Task is already in sync with Project Kanban board.');
      }
    } else if (task.linked_type === 'Deal' && task.linked_id) {
      const dealId = parseInt(task.linked_id);
      const deal = deals.find(d => d.id === dealId);
      
      if (deal && deal.deal_stage !== task.status) {
        if (window.confirm(`Sync Task status with Deal Stage (${deal.deal_stage})?`)) {
          await handleStatusChange(taskId, deal.deal_stage);
        }
      } else if (!deal) {
        alert('Linked deal not found in current view.');
      } else {
        alert('Task is already in sync with Deal board.');
      }
    } else if (task.linked_type === 'Lead' && task.linked_id) {
      const leadId = parseInt(task.linked_id);
      const lead = leads.find(l => l.id === leadId);
      
      if (lead && lead.status !== task.status) {
        if (window.confirm(`Sync Task status with Lead Status (${lead.status})?`)) {
          await handleStatusChange(taskId, lead.status);
        }
      } else if (!lead) {
        alert('Linked lead not found in current view.');
      } else {
        alert('Task is already in sync with Lead board.');
      }
    } else {
      alert('This task is not linked to a project, deal, or lead.');
    }
    setOpenMenuId(null);
  }, [tasks, projects, deals, leads, handleStatusChange]);

  const handleDeleteTask = useCallback(async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const previousTasks = [...tasks];
      setTasks(prev => prev.filter(t => t.id !== taskId));
      try {
        await taskAPI.deleteGeneral(taskId);
        showSuccessToast('Task deleted successfully');
      } catch (err) {
        console.error('Error deleting task:', err);
        showErrorToast('Failed to delete task');
        setTasks(previousTasks);
      }
    }
    setOpenMenuId(null);
  }, [tasks]);

  const tabs = ['All Tasks', 'My Tasks', 'Today', 'Upcoming', 'Overdue', 'Completed'];

  const columns = useMemo(() => [
    {
      key: 'id',
      label: 'Task ID',
      sortable: true,
      render: (value) => <span className="text-xs  text-gray-500">#{value}</span>
    },
    {
      key: 'title',
      label: 'Project Name',
      sortable: true,
      render: (_, row) => (
        <div className="flex flex-col">
          {row.project_name ? (
            <span className="text-xs font-[500] text-blue-600">{row.project_name}</span>
          ) : (
            <span className="text-xs font-[500] text-gray-400">-</span>
          )}
        </div>
      )
    },
    {
      key: 'client_name',
      label: 'Client Name',
      sortable: true,
      render: (value) => <span className="text-xs text-gray-600">{value || '-'}</span>
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-[10px]  ${getPriorityBadgeColor(value)}`}>
          {value}
        </span>
      )
    },
    {
      key: 'due_date',
      label: 'Due Date & Time',
      sortable: true,
      render: (value, row) => (
        <div className="flex flex-col text-gray-600">
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{formatDate(value)}</span>
          </div>
          {row.due_time && (
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Clock size={10} />
              <span>{row.due_time}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'task_type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className="text-xs text-gray-600 flex items-center gap-1">
          {value === 'Call' && <Phone size={12} className="text-teal-500" />}
          {value === 'Message' && <MessageSquare size={12} className="text-blue-500" />}
          {value === 'WhatsApp' && <MessageSquare size={12} className="text-green-500" />}
          {value === 'Google Meet' && <Calendar size={12} className="text-orange-500" />}
          {value === 'Zoom Meeting' && <Calendar size={12} className="text-blue-500" />}
          {value || 'General'}
        </span>
      )
    },
    {
      key: 'next_followup_date',
      label: 'Next Followup',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-1 text-gray-600">
          <Clock size={12} />
          <span>{formatDate(value || row.due_date)}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-[10px]  ${
          value === 'Completed' ? 'bg-green-100 text-green-700' :
          value === 'In Progress' ? 'bg-blue-100 text-blue-700' :
          value === 'Overdue' ? 'bg-red-100 text-red-700' :
          value === 'Converted to Deal' ? 'bg-purple-100 text-purple-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Created Date',
      sortable: true,
      render: (value) => <span className="text-xs text-gray-500">{formatDate(value)}</span>
    },
    {
      key: 'action',
      label: 'Action',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (row.linked_type === 'Lead' && row.linked_id) {
                try {
                  const data = await leadsAPI.getById(row.linked_id);
                  setLeadToEdit(data);
                  setIsLeadModalOpen(true);
                } catch (error) {
                  console.error('Error fetching lead details:', error);
                  // Fallback to local state if API fails
                  const lead = leads.find(l => l.id === parseInt(row.linked_id));
                  if (lead) {
                    setLeadToEdit(lead);
                    setIsLeadModalOpen(true);
                  } else {
                    navigate(`/task/${row.id}`);
                  }
                }
              } else {
                // For other tasks, open the task edit modal
                setEditingTask(row);
                setIsModalOpen(true);
              }
            }}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
            title="View Details"
          >
            <Eye size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteTask(row.id);
            }}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenuId(openMenuId === row.id ? null : row.id);
              }}
              className="p-1 text-gray-400 hover:bg-gray-50 rounded"
            >
              <MoreVertical size={14} />
            </button>
            {openMenuId === row.id && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-50 min-w-[120px]">
                <button
                  onClick={() => handleStatusChange(row.id, 'In Progress')}
                  className="w-full px-3 py-2 text-left text-[10px] hover:bg-gray-50 border-b"
                >
                  Start Task
                </button>
                <button
                  onClick={() => navigate(`/task/${row.id}`)}
                  className="w-full px-3 py-2 text-left text-[10px] hover:bg-gray-50 border-b"
                >
                  View Details
                </button>
                {(row.linked_type === 'Project' || row.linked_type === 'Deal') && row.linked_id && (
                  <button
                    onClick={() => handleSyncKanbanStatus(row.id)}
                    className="w-full px-3 py-2 text-left text-[10px] text-blue-600 hover:bg-blue-50 border-b"
                  >
                    Sync Kanban Status
                  </button>
                )}
                <button
                  onClick={() => handleStatusChange(row.id, 'Completed')}
                  className="w-full px-3 py-2 text-left text-[10px] text-green-600 hover:bg-green-50"
                >
                  Mark Completed
                </button>
              </div>
            )}
          </div>
        </div>
      )
    }
  ], [openMenuId, deals, projects, leads, quotations, navigate, handleStatusChange, handleDeleteTask]);

  useEffect(() => {
    loadTasks();
    loadLeads();
    loadCompanies();
    loadDeals();
    loadProjects();
    loadQuotations();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  useEffect(() => {
    setVisibleColumns(columns.map(c => c.key));
  }, [columns]);
  
  const filterConfigs = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { label: 'To Do', value: 'To Do' },
        { label: 'In Progress', value: 'In Progress' },
        { label: 'Completed', value: 'Completed' },
        { label: 'On Hold', value: 'On Hold' },
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { label: 'Low', value: 'Low' },
        { label: 'Medium', value: 'Medium' },
        { label: 'High', value: 'High' },
        { label: 'Critical', value: 'Critical' },
      ]
    }
  ];

  const loadQuotations = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/estimations`);
      if (response.ok) {
        const data = await response.json();
        setQuotations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading quotations:', err);
    }
  };

  const loadCompanies = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/companies`);
      if (response.ok) {
        const data = await response.json();
        setCompanies(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading companies:', err);
    }
  };

  const loadDeals = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/deals`);
      if (response.ok) {
        const data = await response.json();
        setDeals(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading deals:', err);
    }
  };

  const loadProjects = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/projects`);
      if (response.ok) {
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    }
  };

  const loadLeads = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/leads`);
      if (response.ok) {
        const data = await response.json();
        setLeads(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading leads:', err);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleUpdateLead = async (formData) => {
    try {
      if (leadToEdit) {
        await leadsAPI.update(leadToEdit.id, formData);
        showSuccessToast('Lead updated successfully!');
        loadLeads();
        loadTasks(); // Refresh tasks to show updated lead info
        setIsLeadModalOpen(false);
        setLeadToEdit(null);
      }
    } catch (err) {
      showErrorToast(err.message || 'Failed to update lead');
    }
  };

  const handleCreateTask = async (formData) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const taskData = {
        ...formData,
        created_by: user?.id
      };
      
      let response;
      if (editingTask) {
        response = await fetch(`${apiUrl}/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
      } else {
        response = await fetch(`${apiUrl}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
      }

      if (response.ok) {
        const savedTask = await response.json();
        if (editingTask) {
          setTasks(prev => prev.map(t => t.id === editingTask.id ? savedTask : t));
        } else {
          setTasks(prev => [savedTask, ...prev]);
        }
        setIsModalOpen(false);
        setEditingTask(null);
      }
    } catch (err) {
      console.error('Error saving task:', err);
      throw err;
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // User filter for "My Tasks"
    const isMyTask = !user || (() => {
      if (!task.assigned_to && !task.assigned_to_name) return false;
      if (task.assigned_to_name === user.name) return true;
      
      try {
        let assigned = task.assigned_to;
        if (typeof assigned === 'string') {
          try {
            assigned = JSON.parse(assigned);
          } catch (e) {
            assigned = [assigned];
          }
        }
        
        const assignedArray = Array.isArray(assigned) ? assigned : [assigned];
        return assignedArray.some(id => id && id.toString() === user.id?.toString());
      } catch (e) {
        return false;
      }
    })();
    
    if (activeTab === 'My Tasks' && !isMyTask) return false;
    if (activeTab === 'Completed' && task.status !== 'Completed') return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tDate = task.due_date ? new Date(task.due_date) : null;
    if (tDate) tDate.setHours(0, 0, 0, 0);

    if (activeTab === 'Today') {
      if (!tDate || tDate.getTime() !== today.getTime() || task.status === 'Completed') return false;
    }
    if (activeTab === 'Overdue') {
      if (!tDate || tDate.getTime() >= today.getTime() || task.status === 'Completed') return false;
    }
    if (activeTab === 'Upcoming') {
      if (!tDate || tDate.getTime() <= today.getTime() || task.status === 'Completed') return false;
    }

    // Advanced Filters
    if (selectedFilters.status && selectedFilters.status.length > 0) {
      if (!selectedFilters.status.includes(task.status)) return false;
    }
    if (selectedFilters.priority && selectedFilters.priority.length > 0) {
      if (!selectedFilters.priority.includes(task.priority)) return false;
    }
    if (selectedFilters.linked_type && selectedFilters.linked_type.length > 0) {
      if (!selectedFilters.linked_type.includes(task.linked_type)) return false;
    }

    // Date Range Filter
    if (dateRange.start && dateRange.end) {
      const taskDate = new Date(task.due_date);
      if (taskDate < dateRange.start || taskDate > dateRange.end) return false;
    }
    
    return matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'priority') {
      const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
      return (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4);
    }
    return 0;
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    handleStatusChange(parseInt(draggableId), destination.droppableId);
  };

  const kanbanColumns = [
    { id: 'To Do', title: 'To Do', color: 'bg-gray-100 text-gray-700' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    { id: 'Completed', title: 'Completed', color: 'bg-green-100 text-green-700' },
    { id: 'On Hold', title: 'On Hold', color: 'bg-yellow-100 text-yellow-700' }
  ];

  return (
    <div className="p-2 bg-[#F7F8F9] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header & Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="">
            <h1 className="text-2xl  text-gray-900">Tasks</h1>
            <div className="flex mt-3 items-center border-b border-gray-200">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-xs   transition-colors relative ${
                    activeTab === tab ? 'text-red ' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <SortByDropdown
              current={sortBy}
              onSelect={setSortBy}
            />
            <AdvancedDateRangePicker
              range={dateRange}
              onChange={setDateRange}
            />
            <AdvancedFilterDropdown
              filterConfigs={filterConfigs}
              selectedFilters={selectedFilters}
              onFilterChange={setSelectedFilters}
            />
            <ManageColumnsDropdown
              columns={columns}
              visibleColumns={visibleColumns}
              onChange={setVisibleColumns}
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-gray-200 rounded p-1 shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="List View"
              >
                <List size={15} />
              </button>
              
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'kanban' ? 'bg-red-50 text-red-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Kanban View"
              >
                <Trello size={15} />
              </button>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Plus size={15} /> Add Task
            </button>
          </div>
        </div>

        {/* Content View */}
        {viewMode === 'list' ? (
          <DataTable
            columns={columns}
            data={filteredTasks}
            title="Task List"
            searchKeys={['title', 'description']}
            loading={loading}
            visibleColumns={visibleColumns}
            hideSearch={true}
            externalSearchTerm={searchTerm}
            onRowClick={(row) => navigate(`/task/${row.id}`)}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                getPriorityBadgeColor={getPriorityBadgeColor}
                formatDate={formatDate}
                leads={leads}
                deals={deals}
                projects={projects}
                quotations={quotations}
                handleStatusChange={handleStatusChange}
                handleSyncKanbanStatus={handleSyncKanbanStatus}
                handleDeleteTask={handleDeleteTask}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
              />
            ))}
            {filteredTasks.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded border border-dashed">
                No tasks found matching your filters
              </div>
            )}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4 min-h-[calc(100vh-250px)]">
              {kanbanColumns.map(column => (
                <div key={column.id} className="flex-1 min-w-[250px] bg-gray-50/50 rounded p-3 border border-gray-200">
                  <div className="flex items-center justify-between bg-white mb-4 p-2 rounded">
                    <div className="flex items-center gap-2 ">
                      <h3 className="text-sm  text-gray-700">{column.title}</h3>
                      <span className="px-2 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-500 ">
                        {filteredTasks.filter(t => t.status === column.id).length}
                      </span>
                    </div>
                  </div>
                  
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`space-y-3 min-h-[200px] rounded transition-colors ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
                      >
                        {filteredTasks
                          .filter(t => t.status === column.id)
                          .map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`${snapshot.isDragging ? 'shadow-xl scale-[1.02]' : ''}`}
                                >
                                  <TaskCard 
                                    task={task} 
                                    getPriorityBadgeColor={getPriorityBadgeColor}
                                    formatDate={formatDate}
                                    leads={leads}
                                    deals={deals}
                                    projects={projects}
                                    quotations={quotations}
                                    handleStatusChange={handleStatusChange}
                                    handleSyncKanbanStatus={handleSyncKanbanStatus}
                                    handleDeleteTask={handleDeleteTask}
                                    openMenuId={openMenuId}
                                    setOpenMenuId={setOpenMenuId}
                                    isKanban={true}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      <AddNewTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleCreateTask}
        initialData={editingTask}
      />

      <AddNewLeadModal
        isOpen={isLeadModalOpen}
        onClose={() => {
          setIsLeadModalOpen(false);
          setLeadToEdit(null);
        }}
        onSubmit={handleUpdateLead}
        leadToEdit={leadToEdit}
        companies={companies}
      />
    </div>
  );
};

export default TasksPage;
