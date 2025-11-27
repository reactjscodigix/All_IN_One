import React, { useState } from 'react';
import { Star, Trash2, MoreVertical, Download, Calendar } from 'lucide-react';

const NotesPage = () => {
  const [notes] = useState([
    {
      id: 1,
      title: 'Plan a trip to another country',
      date: '20 Jan 2024',
      priority: 'Medium',
      description: 'Space, the final frontier. These are the voyages of the Starship Enterprise.',
      category: 'Personal',
      isImportant: true,
      avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-01.jpg'
    },
    {
      id: 2,
      title: 'Improve touch typing',
      date: '22 Jan 2024',
      priority: 'Low',
      description: 'Well, the way they make shows is, they make one show.',
      category: 'Work',
      isImportant: true,
      avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-02.jpg'
    },
    {
      id: 3,
      title: 'Learn calligraphy',
      date: '24 Jan 2024',
      priority: 'Low',
      description: 'Calligraphy, the art of beautiful handwriting. It derive from Greek.',
      category: 'Social',
      isImportant: true,
      avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-03.jpg'
    },
    {
      id: 4,
      title: 'Backup Files EOD',
      date: '20 Jan 2024',
      priority: 'High',
      description: 'Project files should be took backup before end of the day.',
      category: 'Personal',
      isImportant: false,
      avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-05.jpg'
    },
    {
      id: 5,
      title: 'Download Server Logs',
      date: '25 Jan 2024',
      priority: 'Medium',
      description: 'Server log is a text document that contains a record of all activity.',
      category: 'Work',
      isImportant: false,
      avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-06.jpg'
    },
    {
      id: 6,
      title: 'Team meet at Starbucks',
      date: '26 Jan 2024',
      priority: 'High',
      description: 'Meeting all teamets at Starbucks for identifying them all.',
      category: 'Social',
      isImportant: false,
      avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-07.jpg'
    },
    {
      id: 7,
      title: 'Create a compost pile',
      date: '27 Jan 2024',
      priority: 'Low',
      description: 'Compost pile refers to fruit and vegetable scraps, used tea etc..',
      category: 'Social',
      isImportant: false,
      avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-08.jpg'
    },
    {
      id: 8,
      title: 'Take a hike at a local park',
      date: '28 Jan 2024',
      priority: 'Medium',
      description: 'Hiking involves a long energetic walk in a natural environment.',
      category: 'Personal',
      isImportant: false,
      avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-09.jpg'
    },
    {
      id: 9,
      title: 'Research a topic interested',
      date: '28 Jan 2024',
      priority: 'High',
      description: 'Research a topic interested by listen actively and attentively.',
      category: 'Work',
      isImportant: false,
      avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-10.jpg'
    }
  ]);

  const getCategoryColor = (category) => {
    const colors = {
      'Personal': { bg: 'bg-blue-100', text: 'text-blue-600', dot: 'bg-blue-500' },
      'Work': { bg: 'bg-green-100', text: 'text-green-600', dot: 'bg-green-500' },
      'Social': { bg: 'bg-yellow-100', text: 'text-yellow-600', dot: 'bg-yellow-500' }
    };
    return colors[category] || { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-500' };
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-600 border-red-300',
      'Medium': 'bg-yellow-100 text-yellow-600 border-yellow-300',
      'Low': 'bg-green-100 text-green-600 border-green-300'
    };
    return colors[priority] || 'bg-gray-100 text-gray-600';
  };

  const importantNotes = notes.filter(n => n.isImportant);

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <button className="text-gray-600 hover:text-gray-900">Home</button>
              <span>›</span>
              <button className="text-gray-600 hover:text-gray-900">Applications</button>
              <span>›</span>
              <span>Notes</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-smooth font-medium text-sm">
                <Download size={16} />
                Export
              </button>
              <div className="hidden group-hover:block absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">Export as PDF</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">Export as Excel</button>
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-smooth font-medium text-sm">
              + Add Notes
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-56 flex-shrink-0">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Notes List</h3>
              
              <button className="w-full bg-red-600 text-white px-4 py-2 rounded text-sm font-medium mb-3 hover:bg-red-700 transition-smooth">
                All Notes
              </button>
              
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2 mb-2">
                <Star size={16} className="text-yellow-400" />
                Important
              </button>
              
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded flex items-center gap-2">
                <Trash2 size={16} />
                Trash
              </button>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <h4 className="text-xs font-bold text-gray-900 mb-3">Tags</h4>
                <div className="space-y-2">
                  <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Pending
                  </button>
                  <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Onhold
                  </button>
                  <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                    Inprogress
                  </button>
                  <button className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Done
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <h4 className="text-xs font-bold text-gray-900 mb-3">Priority</h4>
                <div className="space-y-2">
                  <button className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium hover:bg-yellow-200">
                    Medium
                  </button>
                  <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium hover:bg-red-200">
                    High
                  </button>
                  <button className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200">
                    Low
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Important Notes</h2>
                <button className="text-sm text-red-600 hover:text-red-700 font-medium">Close</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {importantNotes.map((note) => {
                  const categoryColor = getCategoryColor(note.category);
                  return (
                    <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getPriorityBadge(note.priority)}`}>
                          {note.priority}
                        </span>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical size={18} />
                        </button>
                      </div>

                      <h3 className="text-sm font-bold text-gray-900 mb-2">{note.title}</h3>

                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
                        <Calendar size={14} />
                        {note.date}
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{note.description}</p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src={note.avatar} alt={note.category} className="w-6 h-6 rounded-full" />
                          <span className={`px-2 py-1 rounded text-xs font-medium ${categoryColor.text} ${categoryColor.bg}`}>
                            {note.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="text-yellow-400 hover:text-yellow-500">
                            <Star size={16} fill="currentColor" />
                          </button>
                          <button className="text-red-400 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
