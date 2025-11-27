import React, { useState } from 'react';
import { Plus, ChevronDown, MoreVertical } from 'lucide-react';

const KanbanPage = () => {
  const [projects] = useState({
    New: [
      { id: 1, name: 'Doccure', priority: 'Low', budget: '$24,000', tasks: '12/15', dueDate: '15 Apr', assignees: 5 }
    ],
    Inprogress: [
      { id: 2, name: 'Dreams Gigs', priority: 'High', budget: '$24,000', tasks: '12/15', dueDate: '15 Apr', assignees: 5 },
      { id: 3, name: 'Dreams Rent', priority: 'Medium', budget: '$24,000', tasks: '12/15', dueDate: '15 Apr', assignees: 5 }
    ],
    'On-hold': [
      { id: 4, name: 'Dreams Sports', priority: 'Low', budget: '$24,000', tasks: '12/15', dueDate: '15 Apr', assignees: 5 },
      { id: 5, name: 'Dreams Estate', priority: 'Low', budget: '$24,000', tasks: '12/15', dueDate: '15 Apr', assignees: 5 }
    ],
    Completed: [
      { id: 6, name: 'Dreams Rent', priority: 'Medium', budget: '$24,000', tasks: '12/15', dueDate: '15 Apr', assignees: 5 }
    ]
  });

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-700 border border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-700 border border-green-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getColumnCount = (status) => {
    return projects[status]?.length || 0;
  };

  const avatars = [
    'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-10.jpg',
    'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-08.jpg',
    'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-07.jpg',
    'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-02.jpg',
    'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-03.jpg'
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kanban View</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <button className="text-gray-600 hover:text-gray-900">Home</button>
              <span>›</span>
              <button className="text-gray-600 hover:text-gray-900">Applications</button>
              <span>›</span>
              <span>Kanban</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {avatars.slice(0, 3).map((avatar, idx) => (
                  <img key={idx} src={avatar} alt="user" className="w-8 h-8 rounded-full border-2 border-white" />
                ))}
                <span className="text-sm text-gray-700 font-medium">1+</span>
              </div>

              <div className="text-sm">
                <span className="text-gray-600">Total Task: </span>
                <span className="font-bold text-gray-900">55</span>
                <span className="text-gray-600 ml-4">Pending: </span>
                <span className="font-bold text-gray-900">15</span>
                <span className="text-gray-600 ml-4">Completed: </span>
                <span className="font-bold text-gray-900">40</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white appearance-none cursor-pointer hover:border-gray-400">
                  <option>Select Priority</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white appearance-none cursor-pointer hover:border-gray-400">
                  <option>Clients</option>
                  <option>Sophie</option>
                  <option>Cameron</option>
                  <option>Doris</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white appearance-none cursor-pointer hover:border-gray-400">
                  <option>Select Status</option>
                  <option>Inprogress</option>
                  <option>On-hold</option>
                  <option>Completed</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white appearance-none cursor-pointer hover:border-gray-400">
                  <option>Sort By: Recent</option>
                  <option>Recently Added</option>
                  <option>Ascending</option>
                  <option>Descending</option>
                  <option>Last Month</option>
                  <option>Last 7 Days</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['New', 'Inprogress', 'On-hold', 'Completed'].map((status) => (
            <div key={status} className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{status}</h3>
                  <p className="text-xs text-gray-600 mt-1">{String(getColumnCount(status)).padStart(2, '0')}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-96">
                {projects[status]?.map((project) => (
                  <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`px-3 py-1 rounded text-xs font-bold ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical size={14} />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-gray-900 mb-2">{project.name}</h4>

                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                      <div className="flex items-center justify-between">
                        <span>Budget</span>
                        <span className="font-medium text-gray-900">{project.budget}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Tasks</span>
                        <span className="font-medium text-gray-900">{project.tasks}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Due on</span>
                        <span className="font-medium text-gray-900">{project.dueDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {avatars.slice(0, 4).map((avatar, idx) => (
                        <img key={idx} src={avatar} alt="assignee" className="w-6 h-6 rounded-full border-2 border-white" />
                      ))}
                      <span className="text-xs text-gray-600 font-medium ml-1">1+</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 p-4">
                <button className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                  <Plus size={16} />
                  New Project
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KanbanPage;
