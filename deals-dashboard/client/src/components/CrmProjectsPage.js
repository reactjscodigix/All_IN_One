import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreVertical, Plus, Star, Eye, Edit, Trash2 } from 'lucide-react';
import AddProjectModal from './AddProjectModal';
import { projectAPI } from '../services/api';

const CrmProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await projectAPI.getAll();
      
      let projectsList = data;
      if (!Array.isArray(data)) {
        projectsList = data?.data || data?.projects || [];
      }
      
      if (Array.isArray(projectsList)) {
        setProjects(projectsList);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('❌ Failed to load projects:', error);
      setError('Failed to load projects: ' + error.message);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '0000-00-00') return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: '2-digit' });
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
      // Map frontend fields to backend fields
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
        project_id: formData.projectId
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
    const company = (p.company || p.client || '').toLowerCase();
    return projectTitle.includes(searchTerm.toLowerCase()) || 
           company.includes(searchTerm.toLowerCase());
  });

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red ';
      case 'medium': return 'bg-orange-100 text-orange-600';
      case 'low': return 'bg-blue-100 text-white ';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen flex flex-col p-3 ">
      {error && (
        <div className="mb-4">
          <div className="bg-red-50 border border-red-200 rounded  p-2 text-red-700 text-xs ">
            ❌ {error}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl  text-gray-900">Projects Dashboard</h1>
            <span className="bg-red-100 text-red  p-1  rounded text-xs ">{projects.length}</span>
          </div>
          <div className="text-xs  text-gray-500">
            Manage and track all your projects in one place
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded  bg-white text-xs  text-gray-700 hover:bg-gray-50">
            <Download size={16} /> Export
          </button>
          <button 
            onClick={handleAddProject}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded  text-xs  hover:bg-red-700 transition"
          >
            <Plus size={16} /> Add Project
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-2 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1F2020]" />
            <input
              type="text"
              placeholder="Search projects or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded  focus:outline-none focus:border-red-500 text-xs "
            />
          </div>
          <button className="p-2 border border-gray-200 rounded  hover:bg-gray-50">
            <Filter size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="p-2 text-xs  text-gray-500  tracking-wider">Name</th>
                <th className="p-2 text-xs  text-gray-500  tracking-wider">Company</th>
                <th className="p-2 text-xs  text-gray-500  tracking-wider">Priority</th>
                <th className="p-2 text-xs  text-gray-500  tracking-wider">Due Date</th>
                <th className="p-2 text-xs  text-gray-500  tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-2">
                    <div className=" text-gray-900">{project.name || project.title}</div>
                    <div className="text-xs text-gray-500">{project.project_type || 'General'}</div>
                  </td>
                  <td className="p-2 text-xs  text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                      {project.company || project.client || '-'}
                    </div>
                  </td>
                  <td className="p-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs  ${getPriorityColor(project.priority)}`}>
                      {project.priority || 'Medium'}
                    </span>
                  </td>
                  <td className="p-2 text-xs  text-gray-600">
                    {formatDate(project.due_date || project.dueDate)}
                  </td>
                  <td className="p-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="p-1.5 text-[#1F2020] hover:text-white  hover:bg-blue-50 rounded  transition"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleEditProject(project)}
                        className="p-1.5 text-[#1F2020] hover:text-orange-600 hover:bg-orange-50 rounded  transition"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-1.5 text-[#1F2020] hover:text-red  hover:bg-red-50 rounded  transition"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    No projects found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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