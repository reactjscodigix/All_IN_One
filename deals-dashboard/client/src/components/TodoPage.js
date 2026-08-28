import React, { useState, useEffect, useCallback } from 'react';
import { Plus, ChevronDown, MoreVertical, X, Calendar, Star, GripVertical, AlertCircle } from 'lucide-react';
import { taskAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const TodoPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandedPriority, setExpandedPriority] = useState({
    High: true,
    Medium: true,
    Low: true
  });
  const [showModal, setShowModal] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const allTasks = await taskAPI.getAllGeneral();
      
      const userTasks = allTasks.filter(task => {
        const assignedTo = task.assigned_to || [];
        return assignedTo.includes(user.id);
      });

      const processedTasks = userTasks.map(task => ({
        id: task.id,
        title: task.title,
        priority: task.priority,
        date: task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'No due date',
        tags: task.tags || [],
        status: task.status,
        assignees: (task.assigned_to || []).length,
        description: task.description
      }));

      setTodos(processedTasks);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchTasks]);

  const todosByPriority = {
    High: todos.filter(t => t.priority === 'High'),
    Medium: todos.filter(t => t.priority === 'Medium'),
    Low: todos.filter(t => t.priority === 'Low'),
  };

  const stats = {
    total: todos.length,
    pending: todos.filter(t => t.status === 'Open').length,
    inProgress: todos.filter(t => t.status === 'In Progress').length,
    completed: todos.filter(t => t.status === 'Completed').length,
    onHold: todos.filter(t => t.status === 'On Hold').length,
    high: todos.filter(t => t.priority === 'High').length,
    medium: todos.filter(t => t.priority === 'Medium').length,
    low: todos.filter(t => t.priority === 'Low').length,
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Completed': 'bg-green-100 text-green-700',
      'Open': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-yellow-100 text-yellow-700',
      'On Hold': 'bg-red-100 text-red-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getTagStyle = (tag) => {
    const styles = {
      'Projects': 'bg-green-100 text-green-700',
      'Internal': 'bg-red-100 text-red-700',
      'Reminder': 'bg-blue-100 text-blue-700',
      'Social': 'bg-purple-100 text-purple-700',
      'Research': 'bg-indigo-100 text-indigo-700',
      'Meetings': 'bg-pink-100 text-pink-700',
    };
    return styles[tag] || 'bg-gray-100 text-gray-700';
  };

  if (!isAuthenticated) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <AlertCircle size={24} className="text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Authentication Required</h2>
          <p className="text-gray-600 text-center mb-6">Please log in to access tasks and todos</p>
          <a href="/login" className="block w-full text-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Todo</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <span className="font-medium">{user?.first_name} {user?.last_name}</span>
              <span>›</span>
              <button className="text-gray-600 hover:text-gray-900">Home</button>
              <span>›</span>
              <button className="text-gray-600 hover:text-gray-900">Applications</button>
              <span>›</span>
              <span>Todo</span>
            </div>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-smooth font-medium"
          >
            <Plus size={18} />
            Create New
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Total Tasks</div>
            <div className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Open/Pending</div>
            <div className="text-3xl font-bold text-blue-600 mt-1">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">In Progress</div>
            <div className="text-3xl font-bold text-yellow-600 mt-1">{stats.inProgress}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="text-3xl font-bold text-green-600 mt-1">{stats.completed}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-semibold text-red-600 mb-2">High Priority</div>
            <div className="text-2xl font-bold text-gray-900">{stats.high}</div>
            <div className="text-xs text-gray-600 mt-1">{stats.high > 0 ? '⚠️ Needs attention' : '✓ None'}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-semibold text-yellow-600 mb-2">Medium Priority</div>
            <div className="text-2xl font-bold text-gray-900">{stats.medium}</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-sm font-semibold text-green-600 mb-2">Low Priority</div>
            <div className="text-2xl font-bold text-gray-900">{stats.low}</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-border-light p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">My Tasks</h2>
              <div className="flex items-center gap-6 mt-2 text-sm">
                <span className="text-gray-600">On Hold : <span className="font-semibold text-gray-900">{stats.onHold}</span></span>
                <span className="text-gray-600">Assigned : <span className="font-semibold text-gray-900">{stats.total}</span></span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-600 hover:text-gray-900">
                All Tags ▼
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-900">
                Sort By : Recent ▼
              </button>
            </div>
          </div>

          <div className="mb-4 pb-4 border-b border-gray-200">
            <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2">
              <Calendar size={16} />
              Due Date
            </button>
          </div>

          {todos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-2">No tasks assigned</p>
              <p className="text-gray-400 text-sm">You don't have any tasks assigned yet. Create a new task to get started.</p>
            </div>
          ) : (
          <div className="space-y-6">
            {Object.entries(todosByPriority).map(([priority, items]) => (
              <div key={priority}>
                <button
                  onClick={() => setExpandedPriority(prev => ({
                    ...prev,
                    [priority]: !prev[priority]
                  }))}
                  className="flex items-center justify-between w-full mb-4 pb-4 border-b border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <ChevronDown 
                      size={18} 
                      className={`text-gray-600 transition-transform ${expandedPriority[priority] ? '' : '-rotate-90'}`}
                    />
                    <span className={`font-bold text-base ${getPriorityColor(priority)}`}>
                      {priority}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                      {items.length.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">See All →</button>
                </button>

                {expandedPriority[priority] && (
                  <div className="space-y-3 mb-6">
                    {items.map(todo => (
                      <div 
                        key={todo.id}
                        className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-smooth flex items-center gap-3"
                      >
                        <GripVertical size={18} className="text-gray-400 flex-shrink-0" />
                        <Star size={18} className="text-gray-400 flex-shrink-0 cursor-pointer hover:text-yellow-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{todo.title}</h3>
                            <button className="p-1 hover:bg-gray-200 rounded transition-smooth flex-shrink-0">
                              <MoreVertical size={16} className="text-gray-600" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Calendar size={14} />
                              {todo.date}
                            </span>
                            {todo.tags.map(tag => (
                              <span 
                                key={tag}
                                className={`text-xs px-2 py-1 rounded font-medium ${getTagStyle(tag)}`}
                              >
                                {tag}
                              </span>
                            ))}
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${getStatusBadge(todo.status)}`}>
                              {todo.status}
                            </span>
                            <div className="flex -space-x-2">
                              {[...Array(Math.min(todo.assignees, 3))].map((_, i) => (
                                <div 
                                  key={i}
                                  className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                                >
                                  U
                                </div>
                              ))}
                              {todo.assignees > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-gray-700 text-xs font-bold">
                                  +{todo.assignees - 3}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          )}

          <div className="mt-8 text-center">
            <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-smooth font-medium">
              Load More
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Add New Todo</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <input 
                type="text"
                placeholder="Todo Title *"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                <option>Tag *</option>
                <option>Projects</option>
                <option>Internal</option>
                <option>Reminder</option>
              </select>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                <option>Priority *</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <textarea 
                placeholder="Descriptions"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              ></textarea>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                <option>Status *</option>
                <option>Pending</option>
                <option>Inprogress</option>
                <option>Completed</option>
              </select>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-smooth font-medium"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-smooth font-medium"
                >
                  Add Todo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoPage;
