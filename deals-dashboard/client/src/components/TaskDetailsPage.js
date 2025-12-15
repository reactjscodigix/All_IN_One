import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, CheckCircle, Circle, AlertCircle, X } from 'lucide-react';

const TaskDetailsPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadTask();
    loadUsers();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data);
        setEditData(data);
      }
    } catch (err) {
      console.error('Error loading task:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/contacts`);
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updated = { ...task, status: newStatus };
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (response.ok) {
        setTask(updated);
        setEditData(updated);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
          method: 'DELETE',
        });
        navigate('/tasks');
      } catch (err) {
        console.error('Error deleting task:', err);
      }
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (response.ok) {
        setTask(editData);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-700',
      'High': 'bg-orange-100 text-orange-700',
      'Medium': 'bg-yellow-100 text-yellow-700',
      'Low': 'bg-green-100 text-green-700'
    };
    return colors[priority] || colors.Medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-yellow-100 text-yellow-700',
      'Completed': 'bg-green-100 text-green-700',
      'On Hold': 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.Open;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Open': <Circle size={24} className="text-blue-500" />,
      'In Progress': <AlertCircle size={24} className="text-yellow-500" />,
      'Completed': <CheckCircle size={24} className="text-green-500" />,
      'On Hold': <AlertCircle size={24} className="text-red-500" />
    };
    return icons[status] || icons.Open;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { day: 'long', month: 'long', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading task...</div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Task not found</p>
          <button
            onClick={() => navigate('/tasks')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft size={20} /> Back to Tasks
          </button>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={18} />
                </button>
              </>
            )}
            {isEditing && (
              <>
                <button
                  onClick={() => {
                    setEditData(task);
                    setIsEditing(false);
                  }}
                  className="px-3 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          {/* Status */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-gray-100">
              {getStatusIcon(task.status)}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Status</p>
              {isEditing ? (
                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              ) : (
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(task.status)}`}>
                  {task.status}
                </span>
              )}
            </div>
            <div className="ml-auto flex gap-2">
              {!isEditing && (
                <>
                  <button
                    onClick={() => handleStatusChange('Open')}
                    className={`px-4 py-2 rounded-lg border transition ${
                      task.status === 'Open'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Open
                  </button>
                  <button
                    onClick={() => handleStatusChange('In Progress')}
                    className={`px-4 py-2 rounded-lg border transition ${
                      task.status === 'In Progress'
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange('Completed')}
                    className={`px-4 py-2 rounded-lg border transition ${
                      task.status === 'Completed'
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Completed
                  </button>
                </>
              )}
            </div>
          </div>

          <hr className="my-8" />

          {/* Title */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-lg font-semibold"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">{task.title}</h1>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            {isEditing ? (
              <textarea
                value={editData.description || ''}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 resize-none"
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {task.description || 'No description'}
              </p>
            )}
          </div>

          <hr className="my-8" />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-8">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              {isEditing ? (
                <select
                  value={editData.priority}
                  onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              ) : (
                <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.due_date || ''}
                  onChange={(e) => setEditData({ ...editData, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
                />
              ) : (
                <p className="text-gray-700">{formatDate(task.due_date)}</p>
              )}
            </div>

            {/* Task Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Task Type</label>
              <p className="text-gray-700">
                {task.linked_type === 'General' || !task.linked_type
                  ? 'General Task'
                  : `Linked to ${task.linked_type}`}
              </p>
            </div>

            {/* Created Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
              <p className="text-gray-700">{formatDate(task.created_at)}</p>
            </div>
          </div>

          {/* Tags */}
          {task.tags && (() => {
            try {
              const tagsArray = typeof task.tags === 'string' ? JSON.parse(task.tags) : task.tags;
              return Array.isArray(tagsArray) && tagsArray.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {tagsArray.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            } catch (e) {
              return null;
            }
          })()}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
