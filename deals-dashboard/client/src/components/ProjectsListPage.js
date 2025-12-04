import React, { useState, useEffect } from 'react';
import { Plus, Search, MoreHorizontal, Trash2, Eye } from 'lucide-react';
import { projectAPI } from '../services/api';
import AddNewProjectModal from './AddNewProjectModal';

const ProjectsListPage = ({ onProjectSelect }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await projectAPI.getAll();
      setProjects(res);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectAPI.delete(projectId);
        fetchProjects();
      } catch (err) {
        console.error('Error deleting project:', err);
      }
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.project_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === 'created_at') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'Planning': 'bg-blue-50 text-blue-700 border-blue-200',
      'In Progress': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'On Hold': 'bg-orange-50 text-orange-700 border-orange-200',
      'Completed': 'bg-green-50 text-green-700 border-green-200',
      'Cancelled': 'bg-red-50 text-red-700 border-red-200'
    };
    return badges[status] || badges.Planning;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Critical': 'text-red-600',
      'High': 'text-orange-600',
      'Medium': 'text-yellow-600',
      'Low': 'text-green-600'
    };
    return colors[priority] || colors.Medium;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading projects...</div>;
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-sm text-gray-600 mt-1">{sortedProjects.length} projects total</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            <Plus size={18} /> New Project
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-grow">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
              >
                <option value="all">All Status</option>
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500"
              >
                <option value="created_at">Newest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sortedProjects.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 mb-4">No projects found</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium inline-flex items-center gap-2"
                >
                  <Plus size={16} /> Create First Project
                </button>
              </div>
            ) : (
              sortedProjects.map(project => (
                <div key={project.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        <span className={`text-xs font-medium px-2 py-1 rounded border ${getStatusBadge(project.status)}`}>
                          {project.status}
                        </span>
                        {project.priority && (
                          <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                            {project.priority} Priority
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">ID: {project.project_id}</p>
                      {project.description && (
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{project.description}</p>
                      )}
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Type</p>
                          <p className="font-medium text-gray-900">{project.project_type || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Budget</p>
                          <p className="font-medium text-gray-900">${(project.price / 1000).toFixed(0)}K</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Due Date</p>
                          <p className="font-medium text-gray-900">
                            {project.due_date ? new Date(project.due_date).toLocaleDateString() : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Team Members</p>
                          <p className="font-medium text-gray-900">{project.responsible_persons?.length || 0} members</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => onProjectSelect?.(project.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <AddNewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
};

export default ProjectsListPage;
