import React, { useState, useEffect } from 'react';
import { MoreVertical, Plus, Search, Filter, Star, Calendar, Trash2, Edit2, Eye } from 'lucide-react';
import AddNewTaskModal from './AddNewTaskModal';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [starredTasks, setStarredTasks] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/tasks');
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

  const handleCreateTask = async (formData) => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const newTask = await response.json();
        setTasks(prev => [newTask, ...prev]);
      }
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const task = tasks.find(t => t.id === taskId);
    const updatedTask = { ...task, status: newStatus };
    setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));

    try {
      await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTask),
      });
    } catch (err) {
      console.error('Error updating task:', err);
      loadTasks();
    }
    setOpenMenuId(null);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      try {
        await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error('Error deleting task:', err);
        loadTasks();
      }
    }
    setOpenMenuId(null);
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const getStatusColor = (status) => {
    const colors = {
      'Open': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-yellow-100 text-yellow-700',
      'Completed': 'bg-green-100 text-green-700',
      'On Hold': 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.Open;
  };

  const getPriorityBadgeColor = (priority) => {
    const colors = {
      'Critical': 'bg-red-100 text-red-700',
      'High': 'bg-orange-100 text-orange-700',
      'Medium': 'bg-yellow-100 text-yellow-700',
      'Low': 'bg-green-100 text-green-700'
    };
    return colors[priority] || colors.Medium;
  };

  const getBorderColor = (priority) => {
    const colors = {
      'Critical': 'border-l-4 border-red-500',
      'High': 'border-l-4 border-orange-500',
      'Medium': 'border-l-4 border-yellow-500',
      'Low': 'border-l-4 border-green-500'
    };
    return colors[priority] || 'border-l-4 border-gray-500';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const toggleTaskSelect = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const toggleStar = (taskId) => {
    const newStarred = new Set(starredTasks);
    if (newStarred.has(taskId)) {
      newStarred.delete(taskId);
    } else {
      newStarred.add(taskId);
    }
    setStarredTasks(newStarred);
  };

  const TaskItem = ({ task }) => (
    <div className={`bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between hover:shadow-md transition-shadow ${getBorderColor(task.priority)}`}>
      {/* Left Icons */}
      <div className="flex items-center gap-3">
        <div className="cursor-move text-gray-400">⋮⋮</div>
        <input
          type="checkbox"
          checked={selectedTasks.has(task.id)}
          onChange={() => toggleTaskSelect(task.id)}
          className="w-4 h-4 cursor-pointer"
        />
        <button
          onClick={() => toggleStar(task.id)}
          className="text-gray-300 hover:text-yellow-400 transition"
        >
          <Star size={16} fill={starredTasks.has(task.id) ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Title + Badges */}
      <div className="flex-1 px-6">
        <h3 className={`font-medium text-gray-800 ${task.status === 'Completed' ? 'line-through text-gray-500' : ''}`}>
          {task.title}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          {task.priority && (
            <span className={`text-xs px-2 py-1 rounded font-medium ${getPriorityBadgeColor(task.priority)}`}>
              {task.priority}
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
          {task.tags && task.tags.length > 0 && task.tags.map((tag, i) => (
            <span key={i} className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Date + User + Menu */}
      <div className="flex items-center gap-4">
        {task.due_date && (
          <div className="flex items-center text-gray-600 text-sm gap-1 whitespace-nowrap">
            <Calendar size={14} />
            {formatDate(task.due_date)}
          </div>
        )}

        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-semibold">T</span>
        </div>

        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenuId(openMenuId === task.id ? null : task.id);
            }}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <MoreVertical size={16} />
          </button>
          {openMenuId === task.id && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-40"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(task.id, 'Completed');
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
              >
                <Eye size={14} /> Mark Complete
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStatusChange(task.id, 'In Progress');
                }}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
              >
                <Edit2 size={14} /> In Progress
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTask(task.id);
                }}
                className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 w-full bg-gray-50 min-h-screen">
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          Tasks
          <span className="text-gray-500 text-lg bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">
            {tasks.length}
          </span>
        </h1>
        <p className="text-sm text-gray-600 mt-1">Home › Tasks</p>
      </div>

      {/* Search + Buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
        <div className="flex items-center w-full max-w-md bg-white border border-gray-300 rounded-lg px-3 py-2 shadow-sm">
          <Search size={16} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search Keyword"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 text-sm">
            Export
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700 text-sm font-medium"
          >
            + Add New Task
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 text-sm">
          All Tasks
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 text-sm flex items-center gap-2">
          <Filter size={16} /> Filter
        </button>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 text-sm flex items-center gap-2">
          <Calendar size={16} /> 4 Dec 25 – 4 Dec 25
        </button>

        <div className="flex items-center gap-2 ml-auto">
          <input type="checkbox" />
          <span className="text-sm text-gray-600">Mark all as read</span>

          <select className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 text-sm">
            <option>Sort By ▼</option>
            <option>Date</option>
            <option>Priority</option>
            <option>Status</option>
          </select>
        </div>
      </div>

      {/* Recent Title */}
      <h2 className="text-lg font-semibold mb-4">
        Recent <span className="text-gray-500">{filteredTasks.length}</span>
      </h2>

      {/* Task List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-gray-600">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            <p>No tasks found</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 text-red-600 hover:text-red-700 font-medium"
            >
              Create your first task
            </button>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskItem key={task.id} task={task} />
          ))
        )}
      </div>

      <AddNewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export default TasksPage;
