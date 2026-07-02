import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Plus, Layout, BarChart3, Globe, MapPin, 
  ExternalLink, TrendingUp, Star, MoreVertical, 
  Trash2, Edit2, AlertCircle, CheckCircle2, Clock,
  MessageSquare, ClipboardList, ListChecks, User
} from 'lucide-react';
import AdvancedDataTable from './AdvancedDataTable';
import AddNewTaskModal from './AddNewTaskModal';
import { useAuth } from '../hooks/useAuth';
import { marketingAPI, projectAPI, taskAPI, usersAPI } from '../services/api';
import { showSuccessToast, showErrorToast, showInfoToast } from '../utils/toast';

const SeoGmbPage = () => {
  const { user } = useAuth();
  const [seoData, setSeoData] = useState([]);
  const [gmbData, setGmbData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'seo', 'gmb'
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [initialTaskData, setInitialTaskData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTasks = useMemo(() => {
    let list = tasks;
    if (selectedProjectId !== 'all') {
      list = list.filter(t => t.project_id === parseInt(selectedProjectId) || t.linked_id === selectedProjectId);
    }
    return list;
  }, [tasks, selectedProjectId]);

  const filteredSeo = useMemo(() => {
    if (selectedProjectId === 'all') return seoData;
    return seoData.filter(d => d.project_id === parseInt(selectedProjectId));
  }, [seoData, selectedProjectId]);

  const filteredGmb = useMemo(() => {
    if (selectedProjectId === 'all') return gmbData;
    return gmbData.filter(d => d.project_id === parseInt(selectedProjectId));
  }, [gmbData, selectedProjectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [seoRes, gmbRes, projectsRes, tasksRes, usersRes] = await Promise.all([
        marketingAPI.getSeo(),
        marketingAPI.getGmb(),
        projectAPI.getAll(),
        taskAPI.getAllGeneral(),
        usersAPI.getAll()
      ]);

      const seoList = Array.isArray(seoRes) ? seoRes : (seoRes?.data || []);
      const gmbList = Array.isArray(gmbRes) ? gmbRes : (gmbRes?.data || []);
      const projectsList = Array.isArray(projectsRes) ? projectsRes : (projectsRes?.data || []);
      const allTasks = Array.isArray(tasksRes) ? tasksRes : [];
      const usersList = Array.isArray(usersRes) ? usersRes : (usersRes?.data || []);

      // Filter tasks for SEO & GMB
      const filteredTasks = allTasks.filter(t => 
        t.workflow_type === 'SEO' || 
        t.workflow_type === 'GMB' || 
        t.department === 'Marketing' && (t.title?.toLowerCase().includes('seo') || t.title?.toLowerCase().includes('gmb'))
      );

      setSeoData(seoList);
      setGmbData(gmbList);
      setProjects(projectsList);
      setTasks(filteredTasks);
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching SEO/GMB data:', error);
      showErrorToast('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const taskColumns = [
    {
      key: 'title',
      label: 'Task Details',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.title}</span>
          <span className="text-xs text-gray-500 line-clamp-1">{row.description || 'No description'}</span>
        </div>
      )
    },
    {
      key: 'project_name',
      label: 'Client/Project',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-orange-400" />
          <span className="text-xs font-medium text-gray-700">{row.project_name || row.client_name || 'General'}</span>
        </div>
      )
    },
    {
      key: 'workflow_type',
      label: 'Category',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          row.workflow_type === 'SEO' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
          row.workflow_type === 'GMB' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
          'bg-gray-50 text-gray-600'
        }`}>
          {row.workflow_type || 'Marketing'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'Completed' ? 'bg-green-100 text-green-700' :
          row.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (row) => (
        <span className={`text-xs font-medium ${
          row.priority === 'High' ? 'text-red-600' :
          row.priority === 'Medium' ? 'text-orange-600' :
          'text-green-600'
        }`}>
          {row.priority}
        </span>
      )
    },
    {
      key: 'assigned_to_name',
      label: 'Assigned To',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
            <User size={12} className="text-gray-500" />
          </div>
          <span className="text-xs">{row.assigned_to_name || 'Unassigned'}</span>
        </div>
      )
    },
    {
      key: 'due_date',
      label: 'Due Date',
      render: (row) => (
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock size={12} />
          {row.due_date ? new Date(row.due_date).toLocaleDateString() : '-'}
        </div>
      )
    }
  ];

  const seoColumns = [
    {
      key: 'keyword',
      label: 'Keyword',
      render: (row) => {
        let hostname = '';
        try {
          if (row.target_url) {
            hostname = new URL(row.target_url).hostname;
          }
        } catch (e) {
          hostname = row.target_url;
        }

        return (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">{row.keyword}</span>
            {row.target_url && (
              <a 
                href={row.target_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                <Globe size={10} /> {hostname}
              </a>
            )}
          </div>
        );
      }
    },
    {
      key: 'project_id',
      label: 'Project',
      render: (row) => {
        const project = projects.find(p => p.id === row.project_id);
        return project ? project.name : 'N/A';
      }
    },
    {
      key: 'current_ranking',
      label: 'Current Rank',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            row.current_ranking <= 3 ? 'bg-green-100 text-green-700' :
            row.current_ranking <= 10 ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            #{row.current_ranking || '-'}
          </span>
          {row.current_ranking < row.target_ranking && (
            <TrendingUp size={14} className="text-green-500" />
          )}
        </div>
      )
    },
    {
      key: 'target_ranking',
      label: 'Target',
      render: (row) => <span className="text-gray-500 text-xs">Goal: #{row.target_ranking || '-'}</span>
    },
    {
      key: 'search_volume',
      label: 'Volume',
      render: (row) => row.search_volume?.toLocaleString() || '-'
    },
    {
      key: 'competition',
      label: 'Difficulty',
      render: (row) => (
        <span className={`text-xs ${
          row.competition === 'High' ? 'text-red-600' :
          row.competition === 'Medium' ? 'text-orange-600' :
          'text-green-600'
        }`}>
          {row.competition || '-'}
        </span>
      )
    },
    {
      key: 'last_updated',
      label: 'Last Check',
      render: (row) => {
        try {
          const date = new Date(row.last_updated || row.updated_at);
          return <span className="text-xs text-gray-400">{isNaN(date.getTime()) ? '-' : date.toLocaleDateString()}</span>;
        } catch (e) {
          return <span className="text-xs text-gray-400">-</span>;
        }
      }
    }
  ];

  const gmbColumns = [
    {
      key: 'location_name',
      label: 'Location Name',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{row.location_name}</span>
          {row.map_url && (
            <a 
              href={row.map_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline flex items-center gap-1"
            >
              <MapPin size={10} /> View on Maps
            </a>
          )}
        </div>
      )
    },
    {
      key: 'average_rating',
      label: 'Rating',
      render: (row) => (
        <div className="flex items-center gap-1">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{row.average_rating || '0.0'}</span>
          <span className="text-xs text-gray-400">({row.total_reviews || 0})</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const colors = {
          'Active': 'bg-green-100 text-green-700',
          'Needs Optimization': 'bg-yellow-100 text-yellow-700',
          'Pending Verification': 'bg-blue-100 text-blue-700',
          'Suspended': 'bg-red-100 text-red-700'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[row.status] || 'bg-gray-100'}`}>
            {row.status}
          </span>
        );
      }
    },
    {
      key: 'last_post_date',
      label: 'Last Post',
      render: (row) => {
        try {
          const date = row.last_post_date ? new Date(row.last_post_date) : null;
          const dateStr = (date && !isNaN(date.getTime())) ? date.toLocaleDateString() : 'No posts';
          return (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              {dateStr}
            </div>
          );
        } catch (e) {
          return (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              -
            </div>
          );
        }
      }
    }
  ];

  const handleAdd = () => {
    const isSeoTab = activeTab === 'seo';
    const isGmbTab = activeTab === 'gmb';
    
    setInitialTaskData({
      linked_type: 'Project',
      linked_id: selectedProjectId !== 'all' ? selectedProjectId : '',
      workflow_type: isGmbTab ? 'GMB' : 'SEO',
      title: '',
      description: '',
      priority: 'Medium'
    });
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (formData) => {
    try {
      const taskData = {
        ...formData,
        created_by: user?.id,
        department: 'Marketing',
        // Map linked_id to project_id for better backend handling if it's a project
        project_id: formData.linked_type === 'Project' ? formData.linked_id : null,
        // Ensure workflow_type is set correctly if not in formData
        workflow_type: formData.workflow_type || (activeTab === 'tasks' ? 'SEO' : activeTab.toUpperCase()),
        // Combine date and time for reminder if both exist
        reminder_date: (formData.reminder_date && formData.reminder_time) 
          ? `${formData.reminder_date} ${formData.reminder_time}` 
          : formData.reminder_date
      };

      const result = await taskAPI.createGeneral(taskData);
      showSuccessToast('Task created successfully');
      setTasks(prev => [result, ...prev]);
      setIsTaskModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      showErrorToast('Failed to create task');
      throw error;
    }
  };

  const seoChecklist = [
    "Keyword Research & Strategy",
    "On-Page Optimization (Meta, H1-H6)",
    "Content Creation & Optimization",
    "Technical SEO Audit",
    "Backlink Building",
    "Mobile Responsiveness Check",
    "Page Speed Optimization",
    "Schema Markup Implementation"
  ];

  const gmbChecklist = [
    "NAP Consistency Verification",
    "Business Description Optimization",
    "Category Selection & Audit",
    "High-Quality Photo Uploads",
    "Review Generation & Response",
    "Q&A Section Management",
    "Weekly Post Scheduling",
    "Local Citation Building"
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl text-gray-900">SEO & GMB Command Center</h1>
          <p className="text-gray-500 text-sm mt-1">Manage tasks, rankings, and local presence</p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4">
          {/* Client Selector */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm w-full md:w-64">
            <Layout size={16} className="text-gray-400" />
            <select 
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-transparent text-sm font-medium text-gray-700 outline-none w-full cursor-pointer"
            >
              <option value="all">All Clients / Projects</option>
              {projects.filter(p => p.category === 'Marketing' || p.project_type === 'Marketing').map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'tasks' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <ClipboardList size={16} /> Tasks
            </button>
            <button
              onClick={() => setActiveTab('seo')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'seo' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Globe size={16} /> SEO
            </button>
            <button
              onClick={() => setActiveTab('gmb')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'gmb' ? 'bg-red-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MapPin size={16} /> GMB
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {activeTab === 'tasks' ? (
          <>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <ClipboardList size={20} />
                <span className="text-sm font-semibold uppercase tracking-wider">Active Tasks</span>
              </div>
              <div className="text-2xl ">{filteredTasks.filter(t => t.status !== 'Completed').length}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 text-green-600 mb-2">
                <CheckCircle2 size={20} />
                <span className="text-sm font-semibold uppercase tracking-wider">Completed</span>
              </div>
              <div className="text-2xl  text-green-600">
                {filteredTasks.filter(t => t.status === 'Completed').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <AlertCircle size={20} />
                <span className="text-sm font-semibold uppercase tracking-wider">High Priority</span>
              </div>
              <div className="text-2xl  text-red-600">
                {filteredTasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 text-orange-600 mb-2">
                <Clock size={20} />
                <span className="text-sm font-semibold uppercase tracking-wider">Overdue</span>
              </div>
              <div className="text-2xl  text-orange-600">
                {filteredTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'Completed').length}
              </div>
            </div>
          </>
        ) : activeTab === 'seo' ? (
          <>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <BarChart3 size={20} />
                <span className="text-sm font-semibold uppercase tracking-wider">Total Keywords</span>
              </div>
              <div className="text-2xl ">{filteredSeo.length}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 text-green-600 mb-2">
                <TrendingUp size={20} />
                <span className="text-sm font-semibold uppercase tracking-wider">Top 3 Rank</span>
              </div>
              <div className="text-2xl  text-green-600">
                {filteredSeo.filter(d => d.current_ranking <= 3).length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 text-purple-600 mb-2">
                <CheckCircle2 size={20} />
                <span className="text-sm font-semibold uppercase tracking-wider">Targets Met</span>
              </div>
              <div className="text-2xl  text-purple-600">
                {filteredSeo.filter(d => d.current_ranking <= d.target_ranking).length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 text-orange-600 mb-2">
                <AlertCircle size={20} />
                <span className="text-sm font-semibold uppercase tracking-wider">Needs Attention</span>
              </div>
              <div className="text-2xl  text-orange-600">
                {filteredSeo.filter(d => d.current_ranking > 20 || !d.current_ranking).length}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <MapPin size={20} />
                <span className="text-sm font-semibold uppercase tracking-wider">Total Locations</span>
              </div>
              <div className="text-2xl ">{filteredGmb.length}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 text-yellow-500 mb-2">
                <Star size={20} />
                <span className="text-sm font-semibold uppercase tracking-wider">Avg. Rating</span>
              </div>
              <div className="text-2xl ">
                {(filteredGmb.reduce((acc, curr) => acc + parseFloat(curr.average_rating || 0), 0) / (filteredGmb.length || 1)).toFixed(1)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 text-green-600 mb-2">
                <MessageSquare size={20} />
                <span className="text-sm font-semibold uppercase tracking-wider">Total Reviews</span>
              </div>
              <div className="text-2xl  text-green-600">
                {filteredGmb.reduce((acc, curr) => acc + (curr.total_reviews || 0), 0)}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 text-red-600 mb-2">
                <AlertCircle size={20} />
                <span className="text-sm font-semibold uppercase tracking-wider">Pending Posts</span>
              </div>
              <div className="text-2xl  text-red-600">
                {filteredGmb.filter(d => d.status !== 'Active').length}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Listing Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {activeTab === 'tasks' ? (
              <AdvancedDataTable
                title="SEO & GMB Tasks"
                columns={taskColumns}
                data={filteredTasks}
                entityName="Task"
                addLabel="Add Task"
                onAdd={handleAdd}
                searchKeys={['title', 'description', 'workflow_type']}
              />
            ) : activeTab === 'seo' ? (
              <AdvancedDataTable
                title="SEO Ranking Tracker"
                columns={seoColumns}
                data={filteredSeo}
                entityName="Keyword"
                addLabel="Add Keyword"
                onAdd={handleAdd}
                searchKeys={['keyword', 'target_url']}
              />
            ) : (
              <AdvancedDataTable
                title="GMB Presence"
                columns={gmbColumns}
                data={filteredGmb}
                entityName="Location"
                addLabel="Add Location"
                onAdd={handleAdd}
                searchKeys={['location_name', 'status']}
              />
            )}
          </div>
        </div>

        {/* Sidebar Checklists */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-gray-900  mb-4">
              <ListChecks size={20} className="text-blue-600" />
              SEO Essential Checklist
            </div>
            <div className="space-y-3">
              {seoChecklist.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-600 group cursor-pointer">
                  <div className="mt-0.5 w-4 h-4 rounded border border-gray-300 flex-shrink-0 group-hover:border-blue-500 transition-colors" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 text-gray-900  mb-4">
              <MapPin size={20} className="text-orange-600" />
              GMB Weekly Checklist
            </div>
            <div className="space-y-3">
              {gmbChecklist.map((item, i) => (
                <div key={i} className="flex items-start gap-3 text-sm text-gray-600 group cursor-pointer">
                  <div className="mt-0.5 w-4 h-4 rounded border border-gray-300 flex-shrink-0 group-hover:border-orange-500 transition-colors" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <AddNewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setInitialTaskData(null);
        }}
        onSubmit={handleTaskSubmit}
        initialData={initialTaskData}
        projects={projects}
        users={users}
        department="Marketing"
      />
    </div>
  );
};

export default SeoGmbPage;
