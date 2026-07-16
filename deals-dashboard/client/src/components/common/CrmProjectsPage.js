import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, Download, MoreHorizontal, Plus, Star, Eye, Edit, Trash2, FileText, Network, Folder, PlayCircle, CheckCircle, PauseCircle, Clock, XCircle, LayoutGrid, AlignJustify, Calendar, Import, Columns } from 'lucide-react';
import AddProjectModal from './AddProjectModal';
import { projectAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const CrmProjectsPage = ({ department }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigateToProject = (id) => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length >= 3 && parts[1] !== 'employee' && parts[1] !== 'manager') {
      navigate(`/${parts[0]}/${parts[1]}/${parts[2]}/details/${id}`);
    } else if (parts.length >= 3) {
      navigate(`/${parts[0]}/${parts[1]}/${parts[2]}/details/${id}`);
    } else {
      navigate('/projects/details/' + id);
    }
  };
  const [allProjects, setAllProjects] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [activeView, setActiveView] = useState('table');
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (department) {
      const filtered = allProjects.filter(p =>
        (department === 'Marketing' && (p.category === 'Marketing' || p.project_type === 'Marketing' || p.workflow_type === 'Marketing' || p.service_type === 'Marketing')) ||
        (department === 'IT' && (p.category === 'IT' || p.project_type === 'IT' || p.workflow_type === 'IT' || p.service_type === 'IT' || p.category === 'Software'))
      );
      setProjects(filtered);
    } else {
      setProjects(allProjects);
    }
  }, [allProjects, department]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const authFilters = {
        department: user?.department || '',
        user_id: user?.id || '',
        role: user?.role || ''
      };
      
      const data = await projectAPI.getAll(authFilters);

      let projectsList = data;
      if (!Array.isArray(data)) {
        projectsList = data?.data || data?.projects || [];
      }

      if (Array.isArray(projectsList)) {
        setAllProjects(projectsList);
      } else {
        setAllProjects([]);
      }
    } catch (error) {
      console.error('❌ Failed to load projects:', error);
      setError('Failed to load projects: ' + error.message);
      setAllProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00') return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return '-';
    }
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.delete(projectId);
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } catch (err) {
        alert('Failed to delete project: ' + err.message);
      }
    }
  };

  const handleModalSubmit = async (formData) => {
    try {
      const projectData = {
        title: formData.name,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        budget: parseFloat(String(formData.price).replace(/[^0-9.]/g, '')) || 0,
        due_date: formData.dueDate,
        start_date: formData.startDate,
        project_type: formData.projectType,
        company: formData.client,
        company_id: formData.company_id,
        project_id: formData.projectId,
        manager_id: formData.manager_id
      };

      if (editingProject) {
        await projectAPI.update(editingProject.id, projectData);
      } else {
        await projectAPI.create(projectData);
      }
      loadProjects();
      setIsModalOpen(false);
    } catch (err) {
      alert('Failed to save project: ' + err.message);
    }
  };

  const filteredProjects = projects.filter(p => {
    const projectTitle = (p.title || p.name || '').toLowerCase();
    const company = (p.company || p.client || p.company_name || '').toLowerCase();
    const projectIdCode = (p.project_id_code || '').toLowerCase();
    return projectTitle.includes(searchTerm.toLowerCase()) ||
      company.includes(searchTerm.toLowerCase()) ||
      projectIdCode.includes(searchTerm.toLowerCase());
  });

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('progress')) return <span className="text-xs px-2 py-0.5 rounded text-blue-600 bg-blue-50 border border-blue-200">In Progress</span>;
    if (s.includes('review') || s.includes('planning')) return <span className="text-xs px-2 py-0.5 rounded text-purple-600 bg-purple-50 border border-purple-200">Review</span>;
    if (s.includes('complete')) return <span className="text-xs px-2 py-0.5 rounded text-green-600 bg-green-50 border border-green-200">Completed</span>;
    if (s.includes('hold')) return <span className="text-xs px-2 py-0.5 rounded text-orange-600 bg-orange-50 border border-orange-200">On Hold</span>;
    return <span className="text-xs px-2 py-0.5 rounded text-gray-600 bg-gray-50 border border-gray-200">{status || 'Open'}</span>;
  };

  const getPriorityBadge = (priority) => {
    const p = (priority || '').toLowerCase();
    if (p.includes('highest')) return <span className="text-xs px-2 py-0.5 rounded text-red-600 bg-red-50 border border-red-200 font-medium">Highest</span>;
    if (p.includes('high')) return <span className="text-xs px-2 py-0.5 rounded text-red-500 bg-red-50 border border-red-200 font-medium">High</span>;
    if (p.includes('low')) return <span className="text-xs px-2 py-0.5 rounded text-green-600 bg-green-50 border border-green-200 font-medium">Low</span>;
    return <span className="text-xs px-2 py-0.5 rounded text-yellow-600 bg-yellow-50 border border-yellow-200 font-medium">Medium</span>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount || 0);
  };

  // Metrics calculation
  const totalProjects = allProjects.length;
  const inProgress = allProjects.filter(p => (p.status || '').toLowerCase().includes('progress')).length;
  const completed = allProjects.filter(p => (p.status || '').toLowerCase().includes('complete')).length;
  const onHold = allProjects.filter(p => (p.status || '').toLowerCase().includes('hold')).length;
  const overdue = 0; // Placeholder
  const cancelled = 0; // Placeholder

  if (isLoading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen flex flex-col p-4 font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl  text-gray-900">Projects</h1>
        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <span>Dashboard</span> <span className="text-gray-400">›</span>
          <span>Projects</span> <span className="text-gray-400">›</span>
          <span className="text-gray-900 font-medium">All Projects</span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Folder size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Total Projects</div>
            <div className="text-xl  text-gray-900">{totalProjects}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600">
            <PlayCircle size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">In Progress</div>
            <div className="text-xl  text-gray-900">{inProgress}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Completed</div>
            <div className="text-xl  text-gray-900">{completed}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
            <PauseCircle size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">On Hold</div>
            <div className="text-xl  text-gray-900">{onHold}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Overdue</div>
            <div className="text-xl  text-gray-900">{overdue}</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
            <XCircle size={24} />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Cancelled</div>
            <div className="text-xl  text-gray-900">{cancelled}</div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="">

        {/* Toolbar */}
        <div className=" border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg  text-gray-900">All Projects</h2>
            <span className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">{filteredProjects.length} Projects</span>
          </div>
          <div className="flex items-center gap-3 my-4">
            <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition">
              <Import size={14} /> Import
            </button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition">
              <Download size={14} /> Export
            </button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition">
              <Columns size={14} /> Columns
            </button>
            <button className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition">
              <Filter size={14} /> Filters
            </button>
            <button
              onClick={handleAddProject}
              className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 px-4 py-1.5 rounded hover:bg-blue-700 transition shadow-sm"
            >
              <Plus size={14} /> New Project
            </button>
          </div>
        </div>

        {/* Filters Row */}
        <div className=" border-b border-gray-100 flex items-center gap-3">
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, client, manager..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select className="text-xs border border-gray-200 rounded-md px-3 py-2 text-gray-600 outline-none w-36">
            <option>Department</option>
          </select>
          <select className="text-xs border border-gray-200 rounded-md px-3 py-2 text-gray-600 outline-none w-32">
            <option>All Status</option>
          </select>
          <select className="text-xs border border-gray-200 rounded-md px-3 py-2 text-gray-600 outline-none w-32">
            <option>All Priority</option>
          </select>
          <select className="text-xs border border-gray-200 rounded-md px-3 py-2 text-gray-600 outline-none w-36">
            <option>Project Manager</option>
          </select>
          <select className="text-xs border border-gray-200 rounded-md px-3 py-2 text-gray-600 outline-none w-32">
            <option>All Client</option>
          </select>
          <button className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-md px-3 py-2 ml-auto hover:bg-gray-50">
            <Filter size={14} /> More Filters
          </button>
        </div>

        {/* Views Row */}
        <div className="p-2 border-b border-gray-100 flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveView('table')}
            className={`flex items-center gap-1.5 pb-2 -mb-2.5 border-b-2 transition-colors ${activeView === 'table' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-900'
              }`}
          >
            <AlignJustify size={14} /> Table View
          </button>
          <button
            onClick={() => setActiveView('kanban')}
            className={`flex items-center gap-1.5 pb-2 -mb-2.5 border-b-2 transition-colors ${activeView === 'kanban' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-900'
              }`}
          >
            <LayoutGrid size={14} /> Kanban View
          </button>
          <button
            onClick={() => setActiveView('timeline')}
            className={`flex items-center gap-1.5 pb-2 -mb-2.5 border-b-2 transition-colors ${activeView === 'timeline' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-900'
              }`}
          >
            <AlignJustify size={14} /> Timeline View
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`flex items-center gap-1.5 pb-2 -mb-2.5 border-b-2 transition-colors ${activeView === 'calendar' ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-900'
              }`}
          >
            <Calendar size={14} /> Calendar View
          </button>
        </div>

        {/* ── TABLE VIEW ── */}
        {activeView === 'table' && <div className="overflow-x-auto min-h-[300px] pb-16">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-600 uppercase ">
              <tr>
                <th className="p-3 w-10 text-center"><input type="checkbox" className="rounded border-gray-300" /></th>
                <th className="p-3">Project ID</th>
                <th className="p-3">Project Name</th>
                <th className="p-3">Client</th>
                <th className="p-3">Department</th>
                <th className="p-3">Project Manager</th>
                <th className="p-3">Status</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Start Date</th>
                <th className="p-3">End Date</th>
                <th className="p-3">Progress</th>
                <th className="p-3">Budget</th>
                <th className="p-3">Spent</th>
                <th className="p-3">Tasks</th>
                <th className="p-3">Team</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredProjects.map((project) => {
                const progress = project.progress || 0;
                let teamMembers = [];
                if (project.team_members) {
                  try {
                    teamMembers = typeof project.team_members === 'string' ? JSON.parse(project.team_members) : project.team_members;
                  } catch (e) { }
                }

                return (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigateToProject(project.id)}>
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded border-gray-300" /></td>
                    <td className="p-3 text-gray-500">{project.project_id_code || `PRJ-00${project.id}`}</td>
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{project.name || project.title}</div>
                      <div className="text-xs text-gray-500">{project.description ? project.description.substring(0, 30) + '...' : project.project_type || 'General'}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-xs  text-gray-600 overflow-hidden">
                          {project.company_name ? project.company_name.charAt(0) : 'C'}
                        </div>
                        <span className="font-medium text-gray-700">{project.company_name || project.company || project.client || '-'}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-xs text-purple-600 bg-purple-50 border border-purple-100">
                        {project.department_name || project.workflow_type || 'Department'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {project.manager_avatar ? (
                          <img src={project.manager_avatar} alt="Manager" className="w-6 h-6 rounded-full object-cover border border-gray-200" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs ">
                            {project.manager_first_name ? project.manager_first_name.charAt(0) : 'M'}
                          </div>
                        )}
                        <span className="text-gray-700">{project.manager_first_name ? `${project.manager_first_name} ${project.manager_last_name || ''}` : '-'}</span>
                      </div>
                    </td>
                    <td className="p-3">{getStatusBadge(project.status)}</td>
                    <td className="p-3">{getPriorityBadge(project.priority)}</td>
                    <td className="p-3 text-gray-600">{formatDate(project.start_date)}</td>
                    <td className="p-3 text-gray-600">{formatDate(project.due_date || project.end_date)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-600">{progress}%</span>
                      </div>
                    </td>
                    <td className="p-3 font-medium text-gray-900">{formatCurrency(project.budget)}</td>
                    <td className="p-3 font-medium text-gray-900">{formatCurrency(project.spent)}</td>
                    <td className="p-3 text-gray-600">{project.completed_tasks || 0}/{project.total_tasks || 0}</td>
                    <td className="p-3">
                      <div className="flex items-center -space-x-2">
                        {teamMembers && teamMembers.length > 0 ? (
                          teamMembers.slice(0, 3).map((member, idx) => (
                            member.avatar ? (
                              <img key={idx} src={member.avatar} alt="team" className="w-6 h-6 rounded-full border-2 border-white object-cover" />
                            ) : (
                              <div key={idx} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[8px]  text-gray-600">
                                {(member.first_name || 'U').charAt(0)}
                              </div>
                            )
                          ))
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-100"></div>
                        )}
                        {teamMembers && teamMembers.length > 3 && (
                          <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[9px] font-medium text-gray-600">
                            +{teamMembers.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center relative" onClick={(e) => e.stopPropagation()}>
                      <button onClick={(e) => { e.stopPropagation(); setOpenActionMenu(openActionMenu === project.id ? null : project.id); }} className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={16} /></button>
                      {openActionMenu === project.id && (
                        <div className="absolute right-8 top-8 bg-white border border-gray-200 shadow-2xl rounded-lg w-32 z-[9999] overflow-hidden text-left py-1">
                          <button onClick={() => { setOpenActionMenu(null); navigateToProject(project.id); }} className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Eye size={14} /> View Details</button>
                          <button onClick={() => { setOpenActionMenu(null); handleEditProject(project); }} className="w-full px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Edit size={14} /> Edit</button>
                          <button onClick={() => { setOpenActionMenu(null); handleDeleteProject(project.id); }} className="w-full px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14} /> Delete</button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan="16" className="px-6 py-10 text-center text-gray-500">
                    No projects found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>}

        {/* ── KANBAN VIEW ── */}
        {activeView === 'kanban' && (
          <div className="overflow-x-auto p-4">
            <div className="flex gap-4 min-w-max">
              {['New', 'In Progress', 'Review', 'On Hold', 'Completed'].map(status => {
                const colProjects = filteredProjects.filter(p => {
                  const s = (p.status || '').toLowerCase();
                  if (status === 'New') return !s || s === 'new' || s === 'open';
                  if (status === 'In Progress') return s.includes('progress');
                  if (status === 'Review') return s.includes('review') || s.includes('planning');
                  if (status === 'On Hold') return s.includes('hold');
                  if (status === 'Completed') return s.includes('complete');
                  return false;
                });
                const colColors = {
                  'New': { bg: '#EFF6FF', border: '#BFDBFE', header: '#1D4ED8', dot: '#3B82F6' },
                  'In Progress': { bg: '#ECFDF5', border: '#A7F3D0', header: '#065F46', dot: '#10B981' },
                  'Review': { bg: '#F5F3FF', border: '#DDD6FE', header: '#5B21B6', dot: '#8B5CF6' },
                  'On Hold': { bg: '#FFF7ED', border: '#FED7AA', header: '#92400E', dot: '#F59E0B' },
                  'Completed': { bg: '#F0FDF4', border: '#BBF7D0', header: '#166534', dot: '#22C55E' },
                }[status];
                return (
                  <div key={status} style={{ width: 260, flexShrink: 0 }}>
                    <div style={{ background: colColors.bg, border: `1px solid ${colColors.border}`, borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${colColors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: colColors.dot, display: 'inline-block' }} />
                          <span style={{ fontWeight: 700, fontSize: 12, color: colColors.header }}>{status}</span>
                        </div>
                        <span style={{ background: colColors.border, color: colColors.header, fontSize: 11, fontWeight: 700, borderRadius: 12, padding: '1px 8px' }}>{colProjects.length}</span>
                      </div>
                      <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120 }}>
                        {colProjects.map(p => (
                          <div
                            key={p.id}
                            onClick={() => navigateToProject(p.id)}
                            style={{ background: '#fff', borderRadius: 8, padding: '10px 12px', boxShadow: '0 1px 3px rgba(0,0,0,.08)', cursor: 'pointer', border: '1px solid #E5E7EB' }}
                          >
                            <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 4 }}>{p.project_id_code || `PRJ-00${p.id}`}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 6 }}>{p.name || p.title}</div>
                            <div style={{ fontSize: 11, color: '#6B7280', marginBottom: 8 }}>{p.company_name || p.company || '-'}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                              <div style={{ flex: 1, height: 4, background: '#E5E7EB', borderRadius: 4 }}>
                                <div style={{ height: '100%', width: `${p.progress || 0}%`, background: colColors.dot, borderRadius: 4 }} />
                              </div>
                              <span style={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>{p.progress || 0}%</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9CA3AF' }}>
                              <span>Due: {formatDate(p.due_date || p.end_date)}</span>
                              {getPriorityBadge(p.priority)}
                            </div>
                          </div>
                        ))}
                        {colProjects.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '20px 0', fontSize: 12, color: '#9CA3AF' }}>No projects</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TIMELINE VIEW ── */}
        {activeView === 'timeline' && (() => {
          const today = new Date();
          const minDate = new Date(Math.min(...filteredProjects.filter(p => p.start_date).map(p => new Date(p.start_date)), today) - 7 * 86400000);
          const maxDate = new Date(Math.max(...filteredProjects.filter(p => p.due_date || p.end_date).map(p => new Date(p.due_date || p.end_date)), new Date(today.getTime() + 30 * 86400000)));
          const totalDays = Math.max(1, (maxDate - minDate) / 86400000);
          const getLeft = d => !d ? 0 : Math.max(0, (new Date(d) - minDate) / 86400000 / totalDays * 100);
          const getWidth = (s, e) => {
            if (!s || !e) return 5;
            const start = Math.max(new Date(s), minDate);
            const end = Math.min(new Date(e), maxDate);
            return Math.max(1, (end - start) / 86400000 / totalDays * 100);
          };
          const months = [];
          const cur = new Date(minDate); cur.setDate(1);
          while (cur <= maxDate) {
            months.push(new Date(cur));
            cur.setMonth(cur.getMonth() + 1);
          }
          const barColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4'];
          return (
            <div style={{ padding: '16px', overflowX: 'auto' }}>
              <div style={{ minWidth: 900 }}>
                {/* Month headers */}
                <div style={{ display: 'flex', marginLeft: 200, marginBottom: 4 }}>
                  {months.map((m, i) => {
                    const left = getLeft(m);
                    return (
                      <div key={i} style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#6B7280', textAlign: 'center', borderLeft: '1px solid #E5E7EB', padding: '2px 4px' }}>
                        {m.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                      </div>
                    );
                  })}
                </div>
                {/* Project rows */}
                {filteredProjects.map((p, i) => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 8, height: 36 }}>
                    <div style={{ width: 196, paddingRight: 8, flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name || p.title}</div>
                      <div style={{ fontSize: 10, color: '#9CA3AF' }}>{p.company_name || p.company || '-'}</div>
                    </div>
                    <div style={{ flex: 1, position: 'relative', height: 28, background: '#F9FAFB', borderRadius: 4, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                      {/* Grid lines for months */}
                      {months.map((m, mi) => (
                        <div key={mi} style={{ position: 'absolute', left: `${getLeft(m)}%`, top: 0, bottom: 0, borderLeft: '1px solid #E5E7EB' }} />
                      ))}
                      {/* Today line */}
                      <div style={{ position: 'absolute', left: `${getLeft(today)}%`, top: 0, bottom: 0, borderLeft: '2px solid #EF4444', zIndex: 2 }} />
                      {/* Project bar */}
                      {(p.start_date || p.due_date || p.end_date) && (
                        <div
                          title={`${p.name || p.title}: ${formatDate(p.start_date)} → ${formatDate(p.due_date || p.end_date)}`}
                          onClick={() => navigateToProject(p.id)}
                          style={{
                            position: 'absolute',
                            left: `${getLeft(p.start_date || p.due_date || p.end_date)}%`,
                            width: `${getWidth(p.start_date, p.due_date || p.end_date)}%`,
                            top: 4, height: 20, borderRadius: 4,
                            background: barColors[i % barColors.length],
                            cursor: 'pointer', zIndex: 1,
                            display: 'flex', alignItems: 'center', paddingLeft: 6, overflow: 'hidden'
                          }}
                        >
                          <span style={{ fontSize: 10, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.progress || 0}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {filteredProjects.length === 0 && (
                  <div style={{ textAlign: 'center', padding: 40, color: '#9CA3AF', fontSize: 14 }}>No projects to display on timeline.</div>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── CALENDAR VIEW ── */}
        {activeView === 'calendar' && (() => {
          const year = calendarDate.getFullYear();
          const month = calendarDate.getMonth();
          const firstDay = new Date(year, month, 1).getDay();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) => i < firstDay ? null : i - firstDay + 1);
          const dotColors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
          const projectsByDay = {};
          filteredProjects.forEach(p => {
            const d = p.due_date || p.end_date;
            if (!d) return;
            const pd = new Date(d);
            if (pd.getFullYear() === year && pd.getMonth() === month) {
              const day = pd.getDate();
              if (!projectsByDay[day]) projectsByDay[day] = [];
              projectsByDay[day].push(p);
            }
          });
          return (
            <div style={{ padding: 16 }}>
              {/* Calendar nav */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <button
                  onClick={() => setCalendarDate(new Date(year, month - 1, 1))}
                  style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 12px', fontSize: 13, cursor: 'pointer', background: '#fff' }}
                >&lt; Prev</button>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>
                  {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => setCalendarDate(new Date(year, month + 1, 1))}
                  style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 12px', fontSize: 13, cursor: 'pointer', background: '#fff' }}
                >Next &gt;</button>
              </div>
              {/* Day headers */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 4 }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#6B7280', padding: '4px 0' }}>{d}</div>
                ))}
              </div>
              {/* Calendar grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                {cells.map((day, idx) => {
                  const isToday = day && new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                  const dayProjects = day ? (projectsByDay[day] || []) : [];
                  return (
                    <div
                      key={idx}
                      style={{
                        minHeight: 80, background: day ? '#fff' : 'transparent',
                        border: day ? (isToday ? '2px solid #4F46E5' : '1px solid #E5E7EB') : 'none',
                        borderRadius: 8, padding: day ? '6px 8px' : 0
                      }}
                    >
                      {day && (
                        <>
                          <div style={{
                            fontSize: 12, fontWeight: 700,
                            color: isToday ? '#fff' : '#374151',
                            background: isToday ? '#4F46E5' : 'transparent',
                            width: 22, height: 22, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 4
                          }}>{day}</div>
                          {dayProjects.slice(0, 3).map((p, pi) => (
                            <div
                              key={p.id}
                              onClick={() => navigateToProject(p.id)}
                              title={p.name || p.title}
                              style={{
                                fontSize: 10, fontWeight: 600, color: '#fff',
                                background: dotColors[pi % dotColors.length],
                                borderRadius: 4, padding: '1px 5px', marginBottom: 2,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                cursor: 'pointer'
                              }}
                            >
                              {p.name || p.title}
                            </div>
                          ))}
                          {dayProjects.length > 3 && (
                            <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600 }}>+{dayProjects.length - 3} more</div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Pagination Footer (table only) */}
        {activeView === 'table' && <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>Showing 1 to {Math.min(10, filteredProjects.length)} of {filteredProjects.length} projects</div>
          <div className="flex items-center gap-1">
            <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50">&lt;</button>
            <button className="w-6 h-6 flex items-center justify-center rounded bg-blue-600 text-white font-medium">1</button>
            <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50">2</button>
            <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50">3</button>
            <span>...</span>
            <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50">7</button>
            <button className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50">&gt;</button>
            <select className="ml-2 border border-gray-200 rounded px-2 py-1 outline-none">
              <option>10 / page</option>
            </select>
          </div>
        </div>}
      </div>

      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editingProject}
      />
    </div>
  );
};

export default CrmProjectsPage;