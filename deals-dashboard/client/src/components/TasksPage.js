import React, { useState } from 'react';
import { MoreVertical, Plus } from 'lucide-react';

const TasksPage = () => {
  const [tasks] = useState({
    recent: [
      {
        id: 1,
        color: 'blue',
        title: 'Add a form to Update Task',
        tags: ['Calls', 'Pending'],
        category: 'Promotion',
        date: '25 Apr 2025'
      },
      {
        id: 2,
        color: 'blue',
        title: 'Make all strokes thinner',
        tags: ['Email', 'Pending'],
        category: 'Rejected',
        date: '25 Apr 2025'
      },
      {
        id: 3,
        color: 'yellow',
        title: 'Update original content',
        tags: ['Calls', 'Inprogress'],
        category: 'Promotion',
        date: '25 Apr 2025'
      },
      {
        id: 4,
        color: 'yellow',
        title: 'Use only component colours',
        tags: ['Task', 'Inprogress'],
        category: 'Collab',
        date: '25 Apr 2025'
      }
    ],
    yesterday: [
      {
        id: 5,
        color: 'yellow',
        title: 'Add images to the cards section',
        tags: ['Calls', 'Inprogress'],
        category: 'Promotion',
        date: '24 Apr 2025'
      },
      {
        id: 6,
        color: 'red',
        title: 'Add images to the cards section',
        tags: ['Calls', 'Rejected'],
        category: 'Promotion',
        date: '25 Apr 2025'
      }
    ],
    apr23: [
      {
        id: 7,
        color: 'yellow',
        title: 'Design description banner & landing page',
        tags: ['Task', 'Inprogress'],
        category: 'Collab',
        date: '23 Apr 2025'
      },
      {
        id: 8,
        color: 'green',
        title: 'Make all strokes thinner',
        tags: ['Email', 'Completed'],
        category: 'Promotion',
        date: '23 Apr 2025'
      }
    ],
    apr22: [
      {
        id: 9,
        color: 'green',
        title: 'Make all strokes thinner',
        tags: ['Meeting', 'Completed'],
        category: 'Rejected',
        date: '22 Apr 2025'
      }
    ]
  });

  const getBorderColor = (color) => {
    const colors = {
      blue: 'border-blue-400',
      red: 'border-red-400',
      yellow: 'border-yellow-400',
      green: 'border-green-400'
    };
    return colors[color] || 'border-gray-400';
  };

  const getTagColor = (tag) => {
    const colors = {
      'Calls': 'bg-green-100 text-green-700',
      'Email': 'bg-blue-100 text-blue-700',
      'Pending': 'bg-yellow-100 text-yellow-700',
      'Inprogress': 'bg-yellow-100 text-yellow-700',
      'Task': 'bg-purple-100 text-purple-700',
      'Meeting': 'bg-pink-100 text-pink-700',
      'Rejected': 'bg-red-100 text-red-700',
      'Completed': 'bg-green-100 text-green-700'
    };
    return colors[tag] || 'bg-gray-100 text-gray-700';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Promotion': 'bg-red-100 text-red-600',
      'Rejected': 'bg-red-100 text-red-600',
      'Collab': 'bg-green-100 text-green-600'
    };
    return colors[category] || 'bg-gray-100 text-gray-600';
  };

  const TaskItem = ({ task }) => (
    <div className={`bg-white border-l-4 ${getBorderColor(task.color)} p-4 rounded-md flex justify-between items-center hover:shadow-md transition-shadow`}>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{task.title}</p>
        <div className="flex gap-2 mt-2 flex-wrap">
          {task.tags.map((tag, i) => (
            <span key={i} className={`px-2 py-1 text-xs font-medium rounded-md ${getTagColor(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <span className={`px-3 py-1 rounded-md text-sm font-medium ${getCategoryColor(task.category)}`}>
          {task.category}
        </span>
        <span className="text-gray-500 text-sm whitespace-nowrap">{task.date}</span>
        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
          <MoreVertical size={18} className="text-gray-400" />
        </button>
      </div>
    </div>
  );

  const TaskGroup = ({ title, count, tasks: groupTasks }) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-gray-600 font-semibold text-sm">{title}</h3>
        {count && <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-semibold">{count}</span>}
      </div>
      <div className="space-y-3">
        {groupTasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks <span className="text-red-600 text-sm">123</span></h1>
          <p className="text-sm text-gray-500 mt-1">Home / Tasks</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
          <Plus size={18} />
          Add New Task
        </button>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-6">
          <select className="border border-gray-300 px-3 py-2 rounded-md text-sm bg-white hover:border-gray-400 transition-colors">
            <option>All Tasks</option>
          </select>
          <button className="border border-gray-300 px-3 py-2 rounded-md text-sm bg-white hover:bg-gray-50 transition-colors">Filter</button>
          <button className="border border-gray-300 px-3 py-2 rounded-md text-sm bg-white hover:bg-gray-50 transition-colors flex items-center gap-2">
            📅 28 Nov 25 - 28 Nov 25
          </button>
          <div className="ml-auto flex items-center gap-3">
            <button className="text-sm text-gray-600 hover:text-gray-900">Mark all as read</button>
            <select className="border border-gray-300 px-3 py-2 rounded-md text-sm bg-white">
              <option>Sort By ↓</option>
            </select>
          </div>
        </div>

        {/* Tasks Groups */}
        <TaskGroup title="Recent" count={24} tasks={tasks.recent} />
        <TaskGroup title="Yesterday" tasks={tasks.yesterday} />
        <TaskGroup title="23 Apr 2025" tasks={tasks.apr23} />
        <TaskGroup title="22 Apr 2025" tasks={tasks.apr22} />
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-400 py-6 border-t">
        Copyright © 2025 <span className="text-red-600 font-medium">Preadmin</span>
      </div>
    </div>
  );
};

export default TasksPage;
