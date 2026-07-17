import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit3, MoreHorizontal, Plus, FileText, CheckSquare,
  Flag, Users, Clock, DollarSign, UploadCloud, Download,
  Folder as FolderIcon, Send, Calendar as CalendarIcon,
  Search, Filter, PlayCircle, BarChart2, PieChart as PieChartIcon, Trash2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import AddProjectModal from './AddProjectModal';
import AddNewTaskModal from './AddNewTaskModal';
import AddTeamMemberModal from './AddTeamMemberModal';
import AddTimeLogModal from './AddTimeLogModal';
import ITCreateIssueDrawer from '../it/ITCreateIssueDrawer';

const TABS = ['Overview', 'Tasks', 'Milestones', 'Team', 'Documents', 'Discussions', 'Time Logs', 'Activity', 'Reports', 'Timeline', 'Calendar', 'Budget', 'Settings'];

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isTimeLogModalOpen, setIsTimeLogModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  const handleTaskSubmit = async (formData) => {
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        assigned_to: formData.assigned_to[0] || null, // Assuming first assignee
        due_date: formData.due_date,
      };

      let res;
      if (editingTask) {
        res = await fetch(`http://localhost:5000/api/project-tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
      } else {
        res = await fetch(`http://localhost:5000/api/projects/${id}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
      }

      if (!res.ok) throw new Error('Failed to save task');
      
      const tRes = await fetch(`http://localhost:5000/api/projects/${id}/tasks`);
      if (tRes.ok) {
        setProjectTasks(await tRes.json());
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/project-tasks/${taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      
      const tRes = await fetch(`http://localhost:5000/api/projects/${id}/tasks`);
      if (tRes.ok) {
        setProjectTasks(await tRes.json());
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const reloadTeam = async () => {
    try {
      const teamRes = await fetch(`http://localhost:5000/api/projects/${id}/team`);
      if (teamRes.ok) {
        setTeamMembers(await teamRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}/team/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove member');
      reloadTeam();
    } catch (err) {
      alert(err.message);
    }
  };

  const reloadTimeLogs = async () => {
    try {
      const timeRes = await fetch(`http://localhost:5000/api/projects/${id}/timesheets`);
      if (timeRes.ok) {
        setTimeLogs(await timeRes.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const reloadDocuments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/files?project_id=${id}`);
      if (res.ok) {
        setDocuments(await res.json());
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', '1'); // Default fallback user
    formData.append('project_id', id);

    try {
      const res = await fetch('http://localhost:5000/api/files/upload', {
        method: 'POST',
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      await reloadDocuments();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    }
  };

  const handleFileDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/files/${fileId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete file');
      await reloadDocuments();
    } catch (err) {
      alert(err.message);
    }
  };

  const fetchTasks = async () => {
    try {
      const tasksRes = await fetch(`http://localhost:5000/api/projects/${id}/tasks`);
      if (tasksRes.ok) {
        setProjectTasks(await tasksRes.json());
      }
    } catch (err) {
      console.error('Error refreshing tasks:', err);
    }
  };

  const handleEditSubmit = async (formData) => {
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

      const res = await fetch(`http://localhost:5000/api/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      if (!res.ok) throw new Error('Failed to update project');
      
      const pRes = await fetch(`http://localhost:5000/api/projects/${id}`);
      if (pRes.ok) {
         setProject(await pRes.json());
      }
      setIsEditModalOpen(false);
    } catch (err) {
      alert('Failed to save project: ' + err.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const pRes = await fetch(`http://localhost:5000/api/projects/${id}`);
        if (!pRes.ok) throw new Error('Failed to fetch project details');
        const pData = await pRes.json();
        setProject(pData);

        const tRes = await fetch(`http://localhost:5000/api/projects/${id}/tasks`);
        if (tRes.ok) {
          const tData = await tRes.json();
          setProjectTasks(tData);
        }

        const teamRes = await fetch(`http://localhost:5000/api/projects/${id}/team`);
        if (teamRes.ok) {
          setTeamMembers(await teamRes.json());
        }

        const timeRes = await fetch(`http://localhost:5000/api/projects/${id}/timesheets`);
        if (timeRes.ok) {
          setTimeLogs(await timeRes.json());
        }

        const docsRes = await fetch(`http://localhost:5000/api/files?project_id=${id}`);
        if (docsRes.ok) {
          setDocuments(await docsRes.json());
        }
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="w-full h-screen p-8 bg-gray-50 flex flex-col items-center justify-center">
        <h2 className="text-xl  text-gray-900 mb-2">Project not found</h2>
        <p className="text-gray-600 mb-4">{error || "The project you're looking for doesn't exist."}</p>
        <button onClick={() => navigate(-1)} className="p-2 bg-blue-600 text-white rounded-md font-medium text-sm">
          Go Back
        </button>
      </div>
    );
  }



  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(val || 0);

  const stats = {
    todo: projectTasks.filter(t => t.status === 'Open' || t.status === 'To Do').length,
    inProgress: projectTasks.filter(t => t.status === 'In Progress').length,
    review: projectTasks.filter(t => t.status === 'Review' || t.status === 'Pending').length,
    completed: projectTasks.filter(t => t.status === 'Completed' || t.status === 'Closed').length,
    total: projectTasks.length || 1, // avoid division by zero
  };
  const totalReal = projectTasks.length;

  const progress = Math.round((stats.completed / stats.total) * 100);

  const pieData = [
    { name: 'Completed', value: stats.completed, color: '#0ea5e9' },
    { name: 'In Progress', value: stats.inProgress, color: '#2563eb' },
    { name: 'To Do', value: stats.todo, color: '#eab308' },
    { name: 'Review', value: stats.review, color: '#f59e0b' }
  ];

  // =====================
  // TAB RENDER FUNCTIONS
  // =====================

  const renderOverview = () => (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm  text-gray-900 mb-2">Project Overview</h3>
          <p className="text-xs text-gray-600 mb-4 leading-relaxed">
            {project.description || 'No description provided.'}
          </p>
          <div className="space-y-3">
            {[
              ['Project ID', project.project_id_code || `PRJ-00${project.id}`],
              ['Client', project.company_name || project.client || '-'],
              ['Department', project.department_name || project.workflow_type || '-'],
              ['Project Manager', `${project.manager_first_name || ''} ${project.manager_last_name || ''}`.trim() || 'Unassigned'],
              ['Priority', <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded text-[9px] font-medium border border-red-200">{project.priority || '-'}</span>],
              ['Start Date', formatDate(project.start_date)],
              ['End Date', formatDate(project.due_date || project.end_date)],
              ['Status', <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[9px] font-medium border border-blue-200">{project.status || '-'}</span>],
              ['Progress',
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-1 h-1 bg-gray-100 rounded-full"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }}></div></div>
                  <span className="text-xs">{progress}%</span>
                </div>
              ],
            ].map(([label, val], i) => (
              <div key={i} className="flex text-xs">
                <span className="w-1/3 text-gray-500">{label}</span>
                <span className="w-4 text-gray-400">:</span>
                <span className="flex-1 font-medium text-gray-900 flex items-center">{val}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 shadow-sm p-5 flex flex-col">
          <h3 className="text-sm  text-gray-900 mb-6">Progress Overview</h3>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-40 w-40 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl  text-gray-900">{progress}%</span>
                <span className="text-[9px] text-gray-500 w-16 leading-tight">Overall Progress</span>
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-2 w-full px-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-[#0ea5e9]"></div> <span className="text-gray-600">Completed</span></div>
                <span className="font-medium">{stats.completed} ({Math.round((stats.completed / stats.total) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600"></div> <span className="text-gray-600">In Progress</span></div>
                <span className="font-medium">{stats.inProgress} ({Math.round((stats.inProgress / stats.total) * 100)}%)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> <span className="text-gray-600">To Do</span></div>
                <span className="font-medium">{stats.todo} ({Math.round((stats.todo / stats.total) * 100)}%)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm  text-gray-900 mb-6">Task Status</h3>
          <div className="flex flex-col gap-5">
            {[
              { label: 'To Do', count: stats.todo, color: 'bg-gray-200' },
              { label: 'In Progress', count: stats.inProgress, color: 'bg-blue-600' },
              { label: 'Review', count: stats.review, color: 'bg-yellow-500' },
              { label: 'Completed', count: stats.completed, color: 'bg-[#0ea5e9]' },
            ].map((status, i) => {
              const pct = Math.round((status.count / stats.total) * 100) || 0;
              return (
                <div key={i} className="flex items-center text-xs">
                  <span className="w-20 text-gray-600">{status.label}</span>
                  <div className="flex-1 mx-3 h-1.5 bg-gray-100 rounded-full flex overflow-hidden">
                    <div className={`h-full rounded-full ${status.color}`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="w-12 text-right font-medium text-gray-900">{status.count} ({pct}%)</span>
                </div>
              )
            })}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between  text-gray-900 text-[12px]">
              <span>Total</span>
              <span>{totalReal}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="bg-white rounded border border-gray-200 shadow-sm animate-fade-in">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input type="text" placeholder="Search tasks..." className="pl-9 pr-4 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:border-blue-500" />
          </div>
          <button className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50"><Filter size={12} /> Filter</button>
        </div>
        <button onClick={() => setIsCreateDrawerOpen(true)} className="flex items-center gap-1.5 text-xs text-white bg-blue-600 px-3 py-1.5 rounded font-medium hover:bg-blue-700"><Plus size={12} /> Create Task</button>
      </div>
      <table className="w-full text-left whitespace-nowrap text-xs">
        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
          <tr>
            <th className="p-3 font-medium text-center w-10"><input type="checkbox" className="rounded border-gray-300" /></th>
            <th className="p-3 font-medium">Task</th>
            <th className="p-3 font-medium">Assignee</th>
            <th className="p-3 font-medium">Priority</th>
            <th className="p-3 font-medium">Status</th>
            <th className="p-3 font-medium">Due Date</th>
            <th className="p-3 font-medium">Progress</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-gray-700">
          {projectTasks.length > 0 ? projectTasks.map((t, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="p-3 text-center"><input type="checkbox" className="rounded border-gray-300" /></td>
              <td className="p-3 font-medium text-gray-900">{t.title}</td>
              <td className="p-3 flex items-center gap-1.5">
                {t.avatar ? <img src={t.avatar} alt="A" className="w-5 h-5 rounded-full" /> : <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex justify-center items-center  text-[9px]">{t.first_name?.[0] || 'U'}</div>}
                {t.first_name || 'Unassigned'}
              </td>
              <td className="p-3">
                <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${t.priority === 'High' ? 'text-red-500 bg-red-50 border-red-100' : t.priority === 'Medium' ? 'text-orange-500 bg-orange-50 border-orange-100' : 'text-blue-500 bg-blue-50 border-blue-100'}`}>
                  {t.priority || 'Medium'}
                </span>
              </td>
              <td className="p-3">
                <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${t.status === 'Completed' ? 'text-green-600 bg-green-50 border-green-200' : t.status === 'In Progress' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-gray-500 bg-gray-100 border-gray-200'}`}>
                  {t.status || 'To Do'}
                </span>
              </td>
              <td className="p-3 text-gray-500">{formatDate(t.due_date)}</td>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${t.status === 'Completed' ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: t.status === 'Completed' ? '100%' : t.status === 'In Progress' ? '60%' : '0%' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">{t.status === 'Completed' ? '100%' : t.status === 'In Progress' ? '60%' : '0%'}</span>
                </div>
              </td>
              <td className="p-3 text-center">
                <div className="relative inline-block text-left group">
                  <button className="text-gray-400 hover:text-gray-600 focus:outline-none"><MoreHorizontal size={14} /></button>
                  <div className="hidden group-hover:block absolute right-0 z-10 w-24 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <button onClick={() => { setEditingTask(t); setIsTaskModalOpen(true); }} className="text-gray-700 block px-4 py-2 text-xs w-full text-left hover:bg-gray-100">Edit</button>
                      <button onClick={() => handleTaskDelete(t.id)} className="text-red-600 block px-4 py-2 text-xs w-full text-left hover:bg-gray-100">Delete</button>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          )) : (
            <tr><td colSpan="8" className="p-6 text-center text-gray-500">No tasks found. Create one to get started.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderMilestones = () => {
    const milestones = [
      { title: '1. Planning & Research', owner: 'Emma Johnson', start: '01 May 2024', due: '07 May 2024', status: 'Completed', pct: 100 },
      { title: '2. Design & Wireframe', owner: 'Olivia Taylor', start: '08 May 2024', due: '20 May 2024', status: 'Completed', pct: 100 },
      { title: '3. Development', owner: 'Michael Brown', start: '21 May 2024', due: '15 Jun 2024', status: 'In Progress', pct: 60 },
      { title: '4. Testing & QA', owner: 'Sophia Davis', start: '16 Jun 2024', due: '25 Jun 2024', status: 'Not Started', pct: 0 },
      { title: '5. Deployment', owner: 'James Wilson', start: '26 Jun 2024', due: '30 Jun 2024', status: 'Not Started', pct: 0 },
    ];
    return (
      <div className="bg-white rounded border border-gray-200 shadow-sm animate-fade-in">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className=" text-gray-900 text-sm">Project Milestones</h3>
          <button className="flex items-center gap-1.5 text-xs text-white bg-blue-600 px-3 py-1.5 rounded font-medium hover:bg-blue-700"><Plus size={12} /> Add Milestone</button>
        </div>
        <table className="w-full text-left whitespace-nowrap text-xs">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
            <tr>
              <th className="p-3 font-medium">Milestone</th>
              <th className="p-3 font-medium">Owner</th>
              <th className="p-3 font-medium">Start Date</th>
              <th className="p-3 font-medium">Due Date</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {milestones.map((m, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{m.title}</td>
                <td className="p-3 flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex justify-center items-center  text-[9px]">{m.owner[0]}</div>
                  {m.owner}
                </td>
                <td className="p-3 text-gray-500">{m.start}</td>
                <td className="p-3 text-gray-500">{m.due}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-medium border ${m.status === 'Completed' ? 'text-green-600 bg-green-50 border-green-200' : m.status === 'In Progress' ? 'text-blue-600 bg-blue-50 border-blue-200' : 'text-gray-500 bg-gray-100 border-gray-200'}`}>
                    {m.status === 'Completed' ? '✓ Completed' : m.status}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${m.status === 'Completed' ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${m.pct}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500">{m.pct}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTeam = () => {
    const roles = ['Project Manager', 'Developer', 'UI/UX Designer', 'QA Engineer', 'Content Writer', 'Marketing Specialist', 'DevOps'];
    return (
      <div className="bg-white rounded border border-gray-200 shadow-sm animate-fade-in">
        <div className="p-4 border-b border-gray-100 flex justify-end">
          <button onClick={() => setIsTeamModalOpen(true)} className="flex items-center gap-1.5 text-xs text-white bg-blue-600 px-3 py-1.5 rounded font-medium hover:bg-blue-700"><Plus size={12} /> Add Member</button>
        </div>
        <table className="w-full text-left whitespace-nowrap text-xs">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
            <tr>
              <th className="p-3 font-medium">Member</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Department</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Workload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {teamMembers.length > 0 ? teamMembers.map((m, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-3 flex items-center gap-1.5">
                  {m.avatar ? <img src={m.avatar} alt="A" className="w-6 h-6 rounded-full" /> : <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex justify-center items-center  text-xs">{m.first_name?.[0] || 'U'}</div>}
                  <span className="font-medium text-gray-900">{m.first_name} {m.last_name}</span>
                </td>
                <td className="p-3">{roles[i % roles.length]}</td>
                <td className="p-3">{m.department || project.department_name || '-'}</td>
                <td className="p-3 text-blue-600 hover:underline cursor-pointer">{m.email}</td>
                <td className="p-3"><span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[9px] font-medium border border-emerald-100">Active</span></td>
                <td className="p-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 flex-1">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(20, 100 - i * 15)}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500">{Math.max(20, 100 - i * 15)}%</span>
                    </div>
                    <button onClick={() => handleRemoveMember(m.user_id)} className="text-red-500 hover:text-red-700"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="6" className="p-6 text-center text-gray-500">No team members assigned.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDocuments = () => {
    const filteredDocs = documents.filter(doc => 
      doc.name.toLowerCase().includes(fileSearchQuery.toLowerCase())
    );

    return (
      <div className="bg-white rounded border border-gray-200 shadow-sm animate-fade-in">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Search files..." 
                value={fileSearchQuery}
                onChange={(e) => setFileSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-blue-500 w-64" 
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
            <button 
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition shadow-sm cursor-pointer"
            >
              <UploadCloud size={12} /> Upload Document
            </button>
          </div>
        </div>
        <table className="w-full text-left whitespace-nowrap text-xs">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Storage</th>
              <th className="p-3 font-medium">Uploaded By</th>
              <th className="p-3 font-medium">Size</th>
              <th className="p-3 font-medium">Uploaded On</th>
              <th className="p-3 text-center font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {filteredDocs.length > 0 ? filteredDocs.map((doc) => {
              const dateStr = new Date(doc.created_at).toLocaleDateString('en-US', {
                day: 'numeric', month: 'short', year: 'numeric'
              });
              const sizeStr = doc.size_bytes 
                ? (doc.size_bytes > 1024 * 1024 
                  ? (doc.size_bytes / (1024 * 1024)).toFixed(1) + ' MB' 
                  : (doc.size_bytes / 1024).toFixed(0) + ' KB') 
                : '-';

              const fileUrl = doc.file_path ? `http://localhost:5000${doc.file_path}` : '#';

              return (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <FileText className="text-red-500" size={16} /> 
                      <a href={fileUrl} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline">
                        {doc.name}
                      </a>
                    </div>
                  </td>
                  <td className="p-3">{doc.file_type || 'FILE'}</td>
                  <td className="p-3">{doc.storage_type || 'Internal'}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        <span className="text-[9px] text-gray-600">
                          {doc.first_name ? doc.first_name.charAt(0) : 'U'}
                        </span>
                      </div>
                      {doc.first_name ? `${doc.first_name} ${doc.last_name || ''}` : 'System'}
                    </div>
                  </td>
                  <td className="p-3">{sizeStr}</td>
                  <td className="p-3">{dateStr}</td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-3">
                      {doc.file_path && (
                        <a href={fileUrl} download={doc.name} className="text-gray-400 hover:text-gray-600">
                          <Download size={14} />
                        </a>
                      )}
                      <button onClick={() => handleFileDelete(doc.id)} className="text-gray-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-500">
                  No documents found. Click 'Upload Document' to add files.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDiscussions = () => (
    <div className="bg-white rounded border border-gray-200 shadow-sm animate-fade-in flex flex-col" style={{ height: '500px' }}>
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 rounded-t-xl">
        <h3 className=" text-gray-900 text-sm">Project Discussions</h3>
        <div className="text-xs text-gray-500">6 Messages</div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center  text-xs">E</div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-medium text-sm text-gray-900">Emma Johnson</span>
              <span className="text-xs text-gray-400">11:30 AM</span>
            </div>
            <div className="bg-gray-100 text-gray-800 text-sm p-3 rounded rounded-tl-none mt-1 shadow-sm w-fit max-w-[80%]">
              Hey team, I've just uploaded the new wireframes. Please review them by tomorrow.
            </div>
          </div>
        </div>
        <div className="flex gap-3 flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center  text-xs">O</div>
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-gray-400">11:45 AM</span>
              <span className="font-medium text-sm text-gray-900">Olivia Taylor</span>
            </div>
            <div className="bg-blue-600 text-white text-sm p-3 rounded rounded-tr-none mt-1 shadow-sm w-fit max-w-[80%]">
              Looks good! I'll add the new color palette to the style guide today.
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-100">
        <div className="relative">
          <input type="text" placeholder="Type your message..." className="w-full border border-gray-200 rounded pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors" />
          <button className="absolute right-2 top-2 w-8 h-8 bg-blue-600 text-white rounded flex items-center justify-center hover:bg-blue-700 transition">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTimeLogs = () => {
    const totalHoursLogged = timeLogs.reduce((acc, log) => acc + (parseFloat(log.hours_worked) || 0), 0);
    const estimatedHours = project?.budget ? Math.round(project.budget / 50) : 250; // simple estimation logic
    
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Estimated Hours', val: `${estimatedHours}h`, icon: <Clock size={16} />, color: 'text-gray-500 bg-gray-50' },
            { label: 'Logged Hours', val: `${totalHoursLogged}h`, icon: <PlayCircle size={16} />, color: 'text-blue-500 bg-blue-50' },
            { label: 'Remaining Hours', val: `${Math.max(0, estimatedHours - totalHoursLogged)}h`, icon: <Clock size={16} />, color: 'text-orange-500 bg-orange-50' },
            { label: 'Billable', val: `${totalHoursLogged}h`, icon: <DollarSign size={16} />, color: 'text-green-500 bg-green-50' },
            { label: 'Non-Billable', val: '0h', icon: <DollarSign size={16} />, color: 'text-red-500 bg-red-50' }
          ].map((c, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 font-medium">
                <div className={`p-1.5 rounded-full ${c.color}`}>{c.icon}</div>
                {c.label}
              </div>
              <div className="text-xl  text-gray-900">{c.val}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className=" text-gray-900 text-sm">Time Log History</h3>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 text-xs text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded font-medium hover:bg-gray-50"><Download size={12} /> Export</button>
              <button onClick={() => setIsTimeLogModalOpen(true)} className="flex items-center gap-1.5 text-xs text-white bg-blue-600 px-3 py-1.5 rounded font-medium hover:bg-blue-700"><Clock size={12} /> Log Time</button>
            </div>
          </div>
          <table className="w-full text-left whitespace-nowrap text-xs">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
              <tr>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 font-medium">Member</th>
                <th className="p-3 font-medium">Notes</th>
                <th className="p-3 font-medium text-right">Hours</th>
                <th className="p-3 font-medium">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {timeLogs.length > 0 ? timeLogs.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-500">{new Date(r.work_date).toLocaleDateString()}</td>
                  <td className="p-3 font-medium text-gray-900">{r.first_name} {r.last_name || ''}</td>
                  <td className="p-3 text-gray-500">{r.description || '-'}</td>
                  <td className="p-3 font-medium text-right">{r.hours_worked}h</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[9px] font-medium border text-green-600 bg-green-50 border-green-200">
                      Billable
                    </span>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="5" className="p-6 text-center text-gray-500">No time logged yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderActivity = () => (
    <div className="bg-white rounded border border-gray-200 shadow-sm animate-fade-in p-6">
      <h3 className=" text-gray-900 text-sm mb-6">Recent Activity</h3>
      <div className="relative border-l border-gray-200 ml-4 space-y-6 pb-4">
        {[
          { act: 'Project created', by: 'Emma Johnson', date: '01 May 2024, 09:00 AM', det: 'Project has been created' },
          { act: 'Milestone added', by: 'Emma Johnson', date: '01 May 2024, 09:15 AM', det: 'Planning & Research added' },
          { act: 'Task created', by: 'Olivia Taylor', date: '02 May 2024, 10:30 AM', det: 'Wireframe Design task created' },
          { act: 'Document uploaded', by: 'Michael Brown', date: '05 May 2024, 11:45 AM', det: 'Project Proposal.pdf uploaded' },
          { act: 'Task status changed', by: 'Michael Brown', date: '07 May 2024, 02:00 PM', det: 'UI Design status changed to Review' },
        ].map((a, i) => (
          <div key={i} className="pl-6 relative">
            <div className="w-3 h-3 bg-blue-500 rounded-full border-4 border-white absolute -left-1.5 top-1"></div>
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 mb-1">
              <span className="font-medium text-sm text-gray-900">{a.act}</span>
              <span className="text-xs text-gray-400">{a.date}</span>
            </div>
            <div className="text-xs text-gray-500 flex gap-2 items-center">
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">{a.by}</span>
              <span>{a.det}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="flex flex-col gap-6 animate-fade-in">
      <h3 className=" text-gray-900 text-sm">Project Reports</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: <BarChart2 size={24} className="text-purple-500" />, title: 'Project Summary', desc: 'Overall project summary report' },
          { icon: <CheckSquare size={24} className="text-blue-500" />, title: 'Task Report', desc: 'Detailed task status report' },
          { icon: <Clock size={24} className="text-orange-500" />, title: 'Time Log Report', desc: 'Logged hours and time analysis' },
          { icon: <DollarSign size={24} className="text-green-500" />, title: 'Budget Report', desc: 'Budget vs Actual report' },
          { icon: <Users size={24} className="text-red-500" />, title: 'Workload Report', desc: 'Team workload summary' },
          { icon: <PieChartIcon size={24} className="text-emerald-500" />, title: 'Client Report', desc: 'Client-friendly progress report' },
        ].map((r, i) => (
          <div key={i} className="bg-white rounded border border-gray-200 shadow-sm p-5 flex items-center justify-between hover:border-blue-300 transition cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded bg-gray-50 flex items-center justify-center border border-gray-100">
                {r.icon}
              </div>
              <div>
                <h4 className=" text-gray-900 text-sm">{r.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
              </div>
            </div>
            <button className="text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100 px-4 py-1.5 rounded hover:bg-blue-100 transition">
              Generate
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="bg-white rounded border border-gray-200 shadow-sm animate-fade-in p-6 h-[500px] flex items-center justify-center flex-col">
      <BarChart2 size={48} className="text-gray-300 mb-4" />
      <h3 className="text-gray-900  mb-2">Gantt Chart View</h3>
      <p className="text-xs text-gray-500 max-w-md text-center">
        The Timeline visualization is a premium component. In a full implementation, a library like `dhtmlx-gantt` or `frappe-gantt` would be mounted here.
      </p>
    </div>
  );

  const renderCalendar = () => (
    <div className="bg-white rounded border border-gray-200 shadow-sm animate-fade-in p-6 h-[500px] flex items-center justify-center flex-col">
      <CalendarIcon size={48} className="text-gray-300 mb-4" />
      <h3 className="text-gray-900  mb-2">Monthly Calendar</h3>
      <p className="text-xs text-gray-500 max-w-md text-center">
        The Calendar visualization is a premium component. In a full implementation, `react-big-calendar` or `fullcalendar` would be rendered here.
      </p>
    </div>
  );

  const renderBudget = () => (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded p-4 shadow-sm text-center">
          <div className="text-xs text-gray-500 font-medium mb-1">Total Budget</div>
          <div className="text-2xl  text-gray-900">$15,000</div>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4 shadow-sm text-center">
          <div className="text-xs text-gray-500 font-medium mb-1">Spent</div>
          <div className="text-2xl  text-red-500">$9,750</div>
        </div>
        <div className="bg-white border border-gray-200 rounded p-4 shadow-sm text-center">
          <div className="text-xs text-gray-500 font-medium mb-1">Remaining</div>
          <div className="text-2xl  text-green-500">$5,250</div>
        </div>
      </div>
      <div className="bg-white rounded border border-gray-200 shadow-sm p-5">
        <table className="w-full text-left whitespace-nowrap text-xs">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
            <tr>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Budget</th>
              <th className="p-3 font-medium">Spent</th>
              <th className="p-3 font-medium">Remaining</th>
              <th className="p-3 font-medium">% Used</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-700">
            {[
              ['Design', '$3,000', '$2,200', '$800', 73],
              ['Development', '$8,000', '$5,100', '$2,900', 64],
              ['Testing', '$2,000', '$1,300', '$700', 65],
              ['Others', '$2,000', '$1,150', '$850', 58],
            ].map((r, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{r[0]}</td>
                <td className="p-3">{r[1]}</td>
                <td className="p-3 text-red-500">{r[2]}</td>
                <td className="p-3 text-green-500">{r[3]}</td>
                <td className="p-3 flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${r[4]}%` }}></div>
                  </div>
                  <span className="text-xs text-gray-500">{r[4]}%</span>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50  text-gray-900">
              <td className="p-3">Total</td>
              <td className="p-3">$15,000</td>
              <td className="p-3 text-red-500">$9,750</td>
              <td className="p-3 text-green-500">$5,250</td>
              <td className="p-3">65%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="bg-white rounded border border-gray-200 shadow-sm animate-fade-in p-6">
      <h3 className=" text-gray-900 text-sm mb-4">Project Settings</h3>
      <p className="text-xs text-gray-500 mb-6">Manage advanced configuration and access control for this project.</p>

      <div className="space-y-6 max-w-xl text-sm">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Project Name</label>
          <input type="text" defaultValue={project.name || project.title} className="w-full border border-gray-200 rounded-md p-2 focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
          <select className="w-full border border-gray-200 rounded-md p-2 focus:border-blue-500 focus:outline-none">
            <option>Planning</option>
            <option selected={project.status === 'In Progress'}>In Progress</option>
            <option>On Hold</option>
            <option>Completed</option>
          </select>
        </div>
        <div className="pt-4 border-t border-gray-100">
          <h4 className=" text-red-600 text-xs mb-2">Danger Zone</h4>
          <button className="bg-red-50 text-red-600 border border-red-200 p-2 rounded-md text-xs font-medium hover:bg-red-100 transition">
            Archive Project
          </button>
        </div>
      </div>
    </div>
  );

  const renderTopActions = () => {
    return (
      <div className="flex items-center gap-3">
        <button onClick={() => setIsEditModalOpen(true)} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
          <Edit3 size={14} /> Edit Project
        </button>
        <button onClick={() => setIsCreateDrawerOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 flex items-center gap-2 shadow-sm">
          <Plus size={14} /> Create Task
        </button>
      </div>
    );
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'Overview': return renderOverview();
      case 'Tasks': return renderTasks();
      case 'Milestones': return renderMilestones();
      case 'Team': return renderTeam();
      case 'Documents': return renderDocuments();
      case 'Discussions': return renderDiscussions();
      case 'Time Logs': return renderTimeLogs();
      case 'Activity': return renderActivity();
      case 'Reports': return renderReports();
      case 'Timeline': return renderTimeline();
      case 'Calendar': return renderCalendar();
      case 'Budget': return renderBudget();
      case 'Settings': return renderSettings();
      default: return renderOverview();
    }
  };

  return (
    <div className="w-full bg-gray-50 min-h-screen flex flex-col p-4 font-sans">
      <div className="flex items-center text-xs text-gray-500 mb-4 gap-2">
        <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => navigate('/')}>Projects</span>
        <span>›</span>
        <span className="text-blue-600 hover:underline cursor-pointer" onClick={() => navigate(-1)}>All Projects</span>
        <span>›</span>
        <span className="text-gray-900 font-medium">Project Details</span>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl  text-gray-900">{project.name || project.title}</h1>
            <span className="px-2 py-0.5 rounded text-xs font-medium text-blue-600 bg-blue-50 border border-blue-100">
              {project.status || 'In Progress'}
            </span>
          </div>
          <p className="text-xs text-gray-500">{project.project_id_code || `PRJ-00${project.id}`}</p>
        </div>
        {renderTopActions()}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* LEFT SIDEBAR */}
        <div className="w-full lg:w-72 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded border border-gray-200 shadow-sm overflow-hidden">
            <div className="h-40 bg-gradient-to-br from-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4 text-center">
              <h3 className="text-white  text-lg">{project.name}</h3>
              <p className="text-blue-200 text-xs mt-1">Project Details Dashboard</p>
            </div>

            <div className="p-4 flex flex-col gap-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Client</span>
                <span className="font-medium text-blue-600 hover:underline cursor-pointer">{project.company_name || project.client || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Department</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium text-purple-600 bg-purple-50 border border-purple-100">
                  {project.department_name || project.workflow_type || '-'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Project Manager</span>
                <div className="flex items-center gap-1.5 font-medium text-gray-900">
                  {project.manager_avatar ? (
                    <img src={project.manager_avatar} alt="manager" className="w-5 h-5 rounded-full" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] ">
                      {project.manager_first_name ? project.manager_first_name.charAt(0) : 'M'}
                    </div>
                  )}
                  {project.manager_first_name ? `${project.manager_first_name} ${project.manager_last_name || ''}` : '-'}
                </div>
              </div>

              <div className="h-px bg-gray-100 my-1"></div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Start Date</span>
                <span className="font-medium text-gray-900">{formatDate(project.start_date)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">End Date</span>
                <span className="font-medium text-gray-900">{formatDate(project.due_date || project.end_date)}</span>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Progress</span>
                  <span className=" text-gray-900">{progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              <div className="h-px bg-gray-100 my-1"></div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Budget</span>
                <span className="font-medium text-gray-900">{formatCurrency(project.budget)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Spent</span>
                <span className="font-medium text-gray-900">{formatCurrency(project.spent)}</span>
              </div>

              <div className="h-px bg-gray-100 my-1"></div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Status</span>
                <span className="px-2 py-0.5 rounded text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200">
                  {project.status || 'In Progress'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Project Type</span>
                <span className="font-medium text-gray-900">{project.project_type || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex flex-col justify-between h-20">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500"><CheckSquare size={16} /></div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 font-medium">Tasks</div>
                  <div className="text-lg  text-gray-900 leading-tight">{project.completed_tasks || 0} / {project.total_tasks || 0}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex flex-col justify-between h-20">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500"><Flag size={16} /></div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 font-medium">Milestones</div>
                  <div className="text-lg  text-gray-900 leading-tight">3 / 5</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex flex-col justify-between h-20">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-500"><Users size={16} /></div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 font-medium">Team Members</div>
                  <div className="text-lg  text-gray-900 leading-tight">{teamMembers.length || 0}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded border border-gray-200 p-4 shadow-sm flex flex-col justify-between h-20">
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500"><DollarSign size={16} /></div>
                <div className="text-right">
                  <div className="text-xs text-gray-500 font-medium">Budget Spent</div>
                  <div className="text-lg  text-gray-900 leading-tight">{formatCurrency(project.spent)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="border-b border-gray-200 mb-6 flex gap-5 overflow-x-auto hide-scrollbar">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[12px] font-medium whitespace-nowrap border-b-2 transition ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
              >
                {tab}
                {tab === 'Documents' && <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-1.5 rounded-full text-[9px]">24</span>}
                {tab === 'Discussions' && <span className="ml-1 bg-gray-100 text-gray-600 py-0.5 px-1.5 rounded-full text-[9px]">6</span>}
              </button>
            ))}
          </div>

          {/* Active Tab Content */}
          <div className="flex-1 pb-12">
            {renderActiveTab()}
          </div>

        </div>
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
      
      {isEditModalOpen && (
        <AddProjectModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          initialData={project}
          onSubmit={handleEditSubmit}
        />
      )}
      
      {isTaskModalOpen && (
        <AddNewTaskModal
          isOpen={isTaskModalOpen}
          onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
          onSubmit={handleTaskSubmit}
          initialData={editingTask ? {
            ...editingTask,
            assigned_to: editingTask.assigned_to ? [editingTask.assigned_to] : []
          } : { linked_type: 'Project', linked_id: parseInt(id) }}
        />
      )}

      {isCreateDrawerOpen && (
        <ITCreateIssueDrawer 
          isOpen={isCreateDrawerOpen} 
          onClose={() => setIsCreateDrawerOpen(false)} 
          onIssueCreated={fetchTasks} 
          projectId={id}
        />
      )}

      {isTeamModalOpen && (
        <AddTeamMemberModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          projectId={id}
          onAdd={reloadTeam}
        />
      )}

      {isTimeLogModalOpen && (
        <AddTimeLogModal
          isOpen={isTimeLogModalOpen}
          onClose={() => setIsTimeLogModalOpen(false)}
          projectId={id}
          onAdd={reloadTimeLogs}
        />
      )}
    </div>
  );
};

export default ProjectDetailsPage;
