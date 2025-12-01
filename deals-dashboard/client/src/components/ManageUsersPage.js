import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Star,
} from 'lucide-react';

const usersData = [
  {
    id: 1,
    name: 'Darlee Robertson',
    role: 'Facility Manager',
    avatar: 'https://i.pravatar.cc/40?img=1',
    phone: '1234567890',
    email: 'robertson@example.com',
    created: '25 Sep 2025, 12:12 pm',
    lastActivity: '2 mins ago',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Sharon Roy',
    role: 'Installer',
    avatar: 'https://i.pravatar.cc/40?img=2',
    phone: '+1 989757485',
    email: 'sharon@example.com',
    created: '27 Sep 2025, 07:40 am',
    lastActivity: '5 mins ago',
    status: 'Inactive',
  },
  {
    id: 3,
    name: 'Vaughan Lewis',
    role: 'Senior Manager',
    avatar: 'https://i.pravatar.cc/40?img=3',
    phone: '+1 546555455',
    email: 'vaughan12@example.com',
    created: '29 Sep 2025, 08:20 am',
    lastActivity: '2 days ago',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Jessica Louise',
    role: 'Test Engineer',
    avatar: 'https://i.pravatar.cc/40?img=4',
    phone: '+1 454478787',
    email: 'jessica13@example.com',
    created: '25 Sep 2025, 12:12 pm',
    lastActivity: '2 mins ago',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Carol Thomas',
    role: 'UI/UX Designer',
    avatar: 'https://i.pravatar.cc/40?img=5',
    phone: '+1 124547845',
    email: 'carotho3@example.com',
    created: '02 Oct 2025, 10:10 am',
    lastActivity: 'Online',
    status: 'Active',
  },
  {
    id: 6,
    name: 'Dawn Mercha',
    role: 'Technician',
    avatar: 'https://i.pravatar.cc/40?img=6',
    phone: '+1 478845447',
    email: 'dawnmercha@example.com',
    created: '17 Oct 2025, 04:25 pm',
    lastActivity: '3 days ago',
    status: 'Active',
  },
  {
    id: 7,
    name: 'Rachel Hampton',
    role: 'Software Developer',
    avatar: 'https://i.pravatar.cc/40?img=7',
    phone: '+1 215544845',
    email: 'rachel@example.com',
    created: '28 Oct 2025, 07:16 am',
    lastActivity: '10 days ago',
    status: 'Active',
  },
  {
    id: 8,
    name: 'Jonelle Curtiss',
    role: 'Supervisor',
    avatar: 'https://i.pravatar.cc/40?img=8',
    phone: '+1 121145471',
    email: 'jonelle@example.com',
    created: '08 Nov 2025, 06:10 am',
    lastActivity: '1 week ago',
    status: 'Active',
  },
  {
    id: 9,
    name: 'Jonathan Smith',
    role: 'Team Lead Dev',
    avatar: 'https://i.pravatar.cc/40?img=9',
    phone: '+1 321454789',
    email: 'jonathan@example.com',
    created: '15 Nov 2025, 11:50 am',
    lastActivity: '1 day ago',
    status: 'Active',
  },
  {
    id: 10,
    name: 'Brook Carter',
    role: 'Team Lead Dev',
    avatar: 'https://i.pravatar.cc/40?img=10',
    phone: '+1 278907145',
    email: 'brook@example.com',
    created: '25 Nov 2025, 06:34 pm',
    lastActivity: '8 mins ago',
    status: 'Active',
  },
  {
    id: 11,
    name: 'Alex Morgan',
    role: 'Product Manager',
    avatar: 'https://i.pravatar.cc/40?img=11',
    phone: '+1 456789012',
    email: 'alex.morgan@example.com',
    created: '20 Nov 2025, 03:15 pm',
    lastActivity: '2 hours ago',
    status: 'Active',
  },
  {
    id: 12,
    name: 'Emma Wilson',
    role: 'Designer',
    avatar: 'https://i.pravatar.cc/40?img=12',
    phone: '+1 567890123',
    email: 'emma.wilson@example.com',
    created: '18 Nov 2025, 09:45 am',
    lastActivity: '4 days ago',
    status: 'Inactive',
  },
];

const ManageUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return usersData;
    const q = searchQuery.toLowerCase();
    return usersData.filter(u => 
      u.name.toLowerCase().includes(q) || 
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(q)
    );
  }, [searchQuery]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const toggleUserSelection = (userId) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleAllUsers = () => {
    if (selectedUsers.size === paginatedUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginatedUsers.map(u => u.id)));
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                152
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Home › Manage Users</p>
          </div>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
            <span className="text-lg">⊕</span>
            Add User
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Filter Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm bg-white w-64"
                  />
                </div>
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                  <Filter size={16} /> Filter
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📅</span>
                  <span>1 Dec 25 - 1 Dec 25</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                  <Download size={16} /> Export
                  <ChevronDown size={14} />
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50">
                  ↻
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50">
                  ≡
                </button>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0}
                        onChange={toggleAllUsers}
                        className="cursor-pointer w-4 h-4"
                      />
                    </th>
                    <th className="px-6 py-3 text-left">
                      <Star size={16} className="text-gray-400" />
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Phone</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Created</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Last Activity</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                          <Star size={16} />
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                          <div>
                            <p className="font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{user.phone}</td>
                      <td className="px-6 py-4 text-gray-700">{user.email}</td>
                      <td className="px-6 py-4 text-gray-700 text-sm">{user.created}</td>
                      <td className="px-6 py-4 text-gray-700 text-sm">{user.lastActivity}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${
                          user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-gray-200 rounded transition-colors">
                          <MoreVertical size={16} className="text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Show</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded px-2 py-1 bg-white"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span>entries</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === i + 1
                        ? 'bg-red-600 text-white'
                        : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-6 border-t border-gray-200 bg-white mt-6">
        <span>Copyright © 2025 <span className="text-red-600 font-medium">Preadmin</span></span>
        <div className="flex gap-4 justify-center mt-2 text-xs">
          <span className="cursor-pointer hover:text-gray-700">About</span>
          <span className="cursor-pointer hover:text-gray-700">Terms</span>
          <span className="cursor-pointer hover:text-gray-700">Contact Us</span>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersPage;
