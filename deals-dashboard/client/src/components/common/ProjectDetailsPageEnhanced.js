import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, MoreHorizontal, Trash2, Edit2, Share2, Download } from 'lucide-react';
import { projectAPI } from '../../services/api';
import ProjectTasksPanel from './ProjectTasksPanel';
import ProjectActivityPanel from './ProjectActivityPanel';
import ProjectTeamPanel from './ProjectTeamPanel';

const ProjectDetailsPageEnhanced = ({ projectId: propProjectId, onBack }) => {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchProjectDetails();
  }, [propProjectId]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await projectAPI.getById(propProjectId);
      setProject(res);
    } catch (err) {
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateField = async (field, value) => {
    try {
      await projectAPI.update(propProjectId, { ...project, [field]: value });
      setProject({ ...project, [field]: value });
      setEditingField(null);
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Planning': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-yellow-100 text-yellow-700',
      'On Hold': 'bg-orange-100 text-orange-700',
      'Completed': 'bg-green-100 text-green-700',
      'Cancelled': 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.Planning;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Critical': 'text-red-700 bg-red-50 border-red-200',
      'High': 'text-orange-700 bg-orange-50 border-orange-200',
      'Medium': 'text-yellow-700 bg-yellow-50 border-yellow-200',
      'Low': 'text-green-700 bg-green-50 border-green-200'
    };
    return colors[priority] || colors.Medium;
  };

  const formatCurrency = (value) => `$${(value / 1000).toFixed(0)}K`;

  if (loading) return <div className="flex items-center justify-center h-screen">Loading project...</div>;

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Project not found</p>
          <button onClick={onBack} className="p-2  bg-red-600 text-white rounded  hover:bg-red-700">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="p-6 border-b border-gray-200 bg-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded  transition">
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl  text-gray-900">{project.name}</h1>
              <p className="text-xs  text-gray-600">Project ID: {project.project_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2  border border-gray-300 rounded  hover:bg-gray-50 text-xs    text-gray-700 flex items-center gap-2">
              <Share2 size={16} /> Share
            </button>
            <button className="p-2 hover:bg-gray-100 rounded  transition">
              <MoreHorizontal size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="bg-white rounded  border border-gray-200p-3 ">
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs  text-gray-600 mb-1">Status</p>
                  <select
                    value={project.status}
                    onChange={(e) => handleUpdateField('status', e.target.value)}
                    className={`px-3 py-2 rounded-full text-xs   border-none cursor-pointer ${getStatusColor(project.status)}`}
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs  text-gray-600 mb-1">Priority</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs   border ${getPriorityColor(project.priority)}`}>
                    {project.priority || 'Medium'}
                  </span>
                </div>
                <div>
                  <p className="text-xs  text-gray-600 mb-1">Budget</p>
                  <p className="text-xl  text-gray-900">{formatCurrency(project.price)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded  border border-gray-200p-3 ">
              <h3 className="text-md  text-gray-900 mb-4">Project Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs  text-gray-600 mb-1">Project Type</p>
                  <p className="text-xs    text-gray-900">{project.project_type || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs  text-gray-600 mb-1">Category</p>
                  <p className="text-xs    text-gray-900">{project.category || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs  text-gray-600 mb-1">Client</p>
                  <p className="text-xs    text-gray-900">{project.client || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs  text-gray-600 mb-1">Team Leader</p>
                  <p className="text-xs    text-gray-900">{project.team_leader || 'Not assigned'}</p>
                </div>
                <div>
                  <p className="text-xs  text-gray-600 mb-1">Start Date</p>
                  <p className="text-xs    text-gray-900">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-xs  text-gray-600 mb-1">Due Date</p>
                  <p className="text-xs    text-gray-900">
                    {project.due_date ? new Date(project.due_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded  border border-gray-200">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-3   text-xs  border-b-2 ${
                    activeTab === 'overview'
                      ? 'border-red-600 text-red '
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-4 py-3   text-xs  border-b-2 ${
                    activeTab === 'tasks'
                      ? 'border-red-600 text-red '
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-4 py-3   text-xs  border-b-2 ${
                    activeTab === 'activity'
                      ? 'border-red-600 text-red '
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Activity
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs  text-gray-600 mb-2">Description</p>
                      <textarea
                        value={project.description || ''}
                        onChange={(e) => handleUpdateField('description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded  text-xs  min-h-24 resize-none focus:outline-none focus:border-red-500"
                        placeholder="Project description..."
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'tasks' && <ProjectTasksPanel projectId={propProjectId} />}
                {activeTab === 'activity' && <ProjectActivityPanel projectId={propProjectId} />}
              </div>
            </div>
          </div>

          <div className="col-span-1 space-y-6">
            <ProjectTeamPanel projectId={propProjectId} />

            <div className="bg-white rounded  border border-gray-200p-3 ">
              <h3 className="text-md  text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-2  border border-gray-300 rounded  hover:bg-gray-50 text-xs   text-gray-700 transition bg-white flex items-center gap-2 justify-center">
                  <Plus size={16} /> Add Milestone
                </button>
                <button className="w-full p-2  border border-gray-300 rounded  hover:bg-gray-50 text-xs   text-gray-700 transition bg-white flex items-center gap-2 justify-center">
                  <Download size={16} /> Export Report
                </button>
                <button className="w-full p-2  border border-red-300 rounded  hover:bg-red-50 text-xs    text-red-700 transition bg-white flex items-center gap-2 justify-center">
                  <Trash2 size={16} /> Delete Project
                </button>
              </div>
            </div>

            <div className="bg-white rounded  border border-gray-200p-3 ">
              <h3 className="text-md  text-gray-900 mb-4">Timeline</h3>
              <div className="space-y-3 text-xs ">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 flex-shrink-0"></div>
                  <div>
                    <p className="  text-gray-900">Created</p>
                    <p className="text-gray-600">
                      {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                {project.updated_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-gray-400 mt-1 flex-shrink-0"></div>
                    <div>
                      <p className="  text-gray-900">Updated</p>
                      <p className="text-gray-600">{new Date(project.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPageEnhanced;
