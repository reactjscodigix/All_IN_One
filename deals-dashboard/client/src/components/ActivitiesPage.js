import React, { useState } from 'react';
import { MoreVertical, Download, Filter as FilterIcon, Search, Phone, Mail, CheckSquare, Calendar } from 'lucide-react';

const ActivitiesPage = () => {
  const [selectedActivities, setSelectedActivities] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [sortBy, setSortBy] = useState('newest');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const activities = [
    {
      id: '1',
      title: 'We scheduled a meeting for next week',
      type: 'Meeting',
      dueDate: '25 Sep 2025, 12:12 pm',
      owner: 'Hendry Milner',
      ownerInitial: 'HM',
      ownerBg: 'bg-blue-500',
      createdAt: '22 Sep 2025, 10:14 am',
    },
    {
      id: '2',
      title: 'Had conversation with Fred regarding task',
      type: 'Calls',
      dueDate: '29 Sep 2025, 04:12 pm',
      owner: 'Theresa Nelson',
      ownerInitial: 'TN',
      ownerBg: 'bg-purple-500',
      createdAt: '27 Sep 2025, 03:26 pm',
    },
    {
      id: '3',
      title: 'Analysing latest time estimation for new project',
      type: 'Email',
      dueDate: '11 Oct 2025, 05:00 pm',
      owner: 'Guilory Berggren',
      ownerInitial: 'GB',
      ownerBg: 'bg-orange-500',
      createdAt: '03 Oct 2025, 03:53 pm',
    },
    {
      id: '4',
      title: 'Store and manage contact data',
      type: 'Task',
      dueDate: '19 Oct 2025, 02:35 pm',
      owner: 'Jami Carlile',
      ownerInitial: 'JC',
      ownerBg: 'bg-pink-500',
      createdAt: '14 Oct 2025, 01:25 am',
    },
    {
      id: '5',
      title: 'Will have a meeting before project start',
      type: 'Meeting',
      dueDate: '27 Oct 2025, 12:30 pm',
      owner: 'Theresa Nelson',
      ownerInitial: 'TN',
      ownerBg: 'bg-purple-500',
      createdAt: '21 Oct 2025, 03:00 pm',
    },
    {
      id: '6',
      title: 'Call John and discuss about project',
      type: 'Calls',
      dueDate: '12 Nov 2025, 10:20 pm',
      owner: 'Smith Cooper',
      ownerInitial: 'SC',
      ownerBg: 'bg-green-500',
      createdAt: '02 Nov 2025, 05:35 am',
    },
    {
      id: '7',
      title: 'Built landing pages',
      type: 'Task',
      dueDate: '25 Nov 2025, 01:40 pm',
      owner: 'Martin Lewis',
      ownerInitial: 'ML',
      ownerBg: 'bg-red-500',
      createdAt: '20 Nov 2025, 08:20 am',
    },
    {
      id: '8',
      title: 'Regarding latest updates in project',
      type: 'Email',
      dueDate: '30 Nov 2025, 09:20 pm',
      owner: 'Newell Egan',
      ownerInitial: 'NE',
      ownerBg: 'bg-yellow-500',
      createdAt: '25 Nov 2025, 07:20 pm',
    },
    {
      id: '9',
      title: 'Discussed budget proposal with Edwin',
      type: 'Calls',
      dueDate: '08 Dec 2025, 04:35 pm',
      owner: 'Janet Carlson',
      ownerInitial: 'JCA',
      ownerBg: 'bg-indigo-500',
      createdAt: '01 Dec 2025, 10:45 am',
    },
    {
      id: '10',
      title: 'Attach final proposal for upcoming project',
      type: 'Email',
      dueDate: '19 Dec 2025, 02:20 pm',
      owner: 'Craig Brown',
      ownerInitial: 'CB',
      ownerBg: 'bg-cyan-500',
      createdAt: '10 Dec 2025, 06:30 am',
    },
  ];

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'Meeting':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Calendar };
      case 'Calls':
        return { bg: 'bg-green-100', text: 'text-green-700', icon: Phone };
      case 'Email':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Mail };
      case 'Task':
        return { bg: 'bg-red-100', text: 'text-red-700', icon: CheckSquare };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', icon: null };
    }
  };

  const filteredActivities = activities.filter(activity =>
    activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (sortBy === 'oldest') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const paginatedActivities = sortedActivities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(sortedActivities.length / itemsPerPage);

  const toggleActivitySelection = (id) => {
    setSelectedActivities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleAllActivities = () => {
    if (selectedActivities.length === paginatedActivities.length) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(paginatedActivities.map(a => a.id));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-5xl font-bold text-gray-900">Activities</h1>
              <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full">
                {activities.length}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <button className="hover:text-gray-900 font-medium">Home</button>
              <span className="text-gray-400">›</span>
              <span className="text-gray-600">Activities</span>
            </div>
          </div>

          {/* Top Right Buttons */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium">
              <Download size={16} />
              Export
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700">
              + Add New Activity
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        {/* Action Bar */}
        <div className="mb-6 flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-700">All Activities</span>
            <div className="flex gap-2 border-l border-gray-300 pl-4">
              <Phone size={18} className="text-gray-600 cursor-pointer hover:text-gray-900" />
              <Mail size={18} className="text-gray-600 cursor-pointer hover:text-gray-900" />
              <CheckSquare size={18} className="text-gray-600 cursor-pointer hover:text-gray-900" />
              <Calendar size={18} className="text-gray-600 cursor-pointer hover:text-gray-900" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium">
                Sort By ▼
              </button>
            </div>

            <div className="relative">
              <button className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg text-sm font-medium">
                <FilterIcon size={16} />
                Filter
              </button>
            </div>

            <button className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">
              Manage Columns
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-5 text-left">
                  <input
                    type="checkbox"
                    checked={selectedActivities.length === paginatedActivities.length && paginatedActivities.length > 0}
                    onChange={toggleAllActivities}
                    className="rounded cursor-pointer"
                  />
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-900 uppercase">Title</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-900 uppercase">Activity Type</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-900 uppercase">Due Date</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-900 uppercase">Owner</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-900 uppercase">Created At</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-900 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedActivities.length > 0 ? (
                paginatedActivities.map((activity) => {
                  const activityColor = getActivityTypeColor(activity.type);
                  return (
                    <tr key={activity.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selectedActivities.includes(activity.id)}
                          onChange={() => toggleActivitySelection(activity.id)}
                          className="rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600">{activity.title}</td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${activityColor.bg} ${activityColor.text}`}
                        >
                          {activity.type}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600">{activity.dueDate}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 ${activity.ownerBg} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                            {activity.ownerInitial.substring(0, 1)}
                          </div>
                          <span className="text-sm text-gray-900 font-medium">{activity.owner}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-600">{activity.createdAt}</td>
                      <td className="px-6 py-5 text-center">
                        <button className="text-gray-400 hover:text-gray-600 p-1">
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    No activities found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  currentPage === page
                    ? 'bg-red-600 text-white'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;
