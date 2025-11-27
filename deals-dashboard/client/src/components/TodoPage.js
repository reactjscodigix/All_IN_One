import React, { useState } from 'react';
import { Plus, ChevronDown, MoreVertical, X, Calendar, Star, GripVertical } from 'lucide-react';

const TodoPage = () => {
  const [todos] = useState([
    {
      id: 1,
      title: 'Finalize project proposal',
      priority: 'High',
      date: '15 Jan 2025',
      tags: ['Projects'],
      status: 'Onhold',
      assignees: 3
    },
    {
      id: 2,
      title: 'Submit to supervisor by EOD',
      priority: 'High',
      date: '25 May 2024',
      tags: ['Internal'],
      status: 'Inprogress',
      assignees: 3
    },
    {
      id: 3,
      title: 'Prepare presentation slides',
      priority: 'High',
      date: '15 Jan 2025',
      tags: ['Reminder'],
      status: 'Pending',
      assignees: 3
    },
    {
      id: 4,
      title: 'Check and respond to emails',
      priority: 'Medium',
      date: 'Tomorrow',
      tags: ['Reminder'],
      status: 'Completed',
      assignees: 3
    },
    {
      id: 5,
      title: 'Coordinate with department head on progress',
      priority: 'Medium',
      date: '25 May 2024',
      tags: ['Internal'],
      status: 'Inprogress',
      assignees: 3
    },
    {
      id: 6,
      title: 'Plan tasks for the next day',
      priority: 'Low',
      date: 'Today',
      tags: ['Social'],
      status: 'Pending',
      assignees: 3
    },
  ]);

  const [expandedPriority, setExpandedPriority] = useState({
    High: true,
    Medium: true,
    Low: true
  });

  const [showModal, setShowModal] = useState(false);

  const todosByPriority = {
    High: todos.filter(t => t.priority === 'High'),
    Medium: todos.filter(t => t.priority === 'Medium'),
    Low: todos.filter(t => t.priority === 'Low'),
  };

  const stats = {
    total: todos.length,
    pending: todos.filter(t => t.status === 'Pending').length,
    completed: todos.filter(t => t.status === 'Completed').length,
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
      'Pending': 'bg-blue-100 text-blue-700',
      'Inprogress': 'bg-yellow-100 text-yellow-700',
      'Onhold': 'bg-red-100 text-red-700',
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Todo</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
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

        <div className="bg-white rounded-lg shadow-sm border border-border-light p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Total Todo</h2>
              <div className="flex items-center gap-6 mt-2 text-sm">
                <span className="text-gray-600">Total Task : <span className="font-semibold text-gray-900">{stats.total}</span></span>
                <span className="text-gray-600">Pending : <span className="font-semibold text-gray-900">{stats.pending}</span></span>
                <span className="text-gray-600">Completed : <span className="font-semibold text-green-600">{stats.completed}</span></span>
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
