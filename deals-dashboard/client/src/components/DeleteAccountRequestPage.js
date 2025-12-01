import React, { useState, useMemo } from 'react';
import { Search, MoreVertical, Download, ChevronDown, Filter } from 'lucide-react';

const deleteRequestsData = [
  {
    id: 1,
    name: 'Darlee Robertson',
    role: 'Facility Manager',
    avatar: 'https://i.pravatar.cc/100?img=32',
    requisitionDate: '25 Sep 2025, 12:12 pm',
    deleteDate: '25 Sep 2025, 12:12 pm',
    reason: 'No longer using service',
    status: 'Rejected',
  },
  {
    id: 2,
    name: 'Sharon Roy',
    role: 'Installer',
    avatar: 'https://i.pravatar.cc/100?img=12',
    requisitionDate: '27 Sep 2025, 07:40 am',
    deleteDate: '27 Sep 2025, 07:40 am',
    reason: 'Privacy concerns',
    status: 'Pending',
  },
  {
    id: 3,
    name: 'Vaughan Lewis',
    role: 'Senior Manager',
    avatar: 'https://i.pravatar.cc/100?img=22',
    requisitionDate: '29 Sep 2025, 08:20 am',
    deleteDate: '29 Sep 2025, 08:20 am',
    reason: 'Duplicate account',
    status: 'Rejected',
  },
  {
    id: 4,
    name: 'Jessica Louise',
    role: 'Test Engineer',
    avatar: 'https://i.pravatar.cc/100?img=8',
    requisitionDate: '25 Sep 2025, 12:12 pm',
    deleteDate: '25 Sep 2025, 12:12 pm',
    reason: 'Technical issues',
    status: 'Rejected',
  },
  {
    id: 5,
    name: 'Carol Thomas',
    role: 'UI / UX Designer',
    avatar: 'https://i.pravatar.cc/100?img=3',
    requisitionDate: '02 Oct 2025, 10:10 am',
    deleteDate: '02 Oct 2025, 10:10 am',
    reason: 'Receiving too many emails',
    status: 'Pending',
  },
  {
    id: 6,
    name: 'Dawn Mercha',
    role: 'Technician',
    avatar: 'https://i.pravatar.cc/100?img=11',
    requisitionDate: '17 Oct 2025, 04:25 pm',
    deleteDate: '17 Oct 2025, 04:25 pm',
    reason: 'Privacy concerns',
    status: 'Pending',
  },
  {
    id: 7,
    name: 'Rachel Hampton',
    role: 'Software Developer',
    avatar: 'https://i.pravatar.cc/100?img=5',
    requisitionDate: '28 Oct 2025, 07:16 am',
    deleteDate: '28 Oct 2025, 07:16 am',
    reason: 'Duplicate account',
    status: 'Pending',
  },
  {
    id: 8,
    name: 'Jonelle Curtiss',
    role: 'Supervisor',
    avatar: 'https://i.pravatar.cc/100?img=7',
    requisitionDate: '08 Nov 2025, 06:10 am',
    deleteDate: '08 Nov 2025, 06:10 am',
    reason: 'No longer using service',
    status: 'Pending',
  },
  {
    id: 9,
    name: 'Jonathan Smith',
    role: 'Team Lead Dev',
    avatar: 'https://i.pravatar.cc/100?img=9',
    requisitionDate: '15 Nov 2025, 11:50 am',
    deleteDate: '15 Nov 2025, 11:50 am',
    reason: 'No longer using service',
    status: 'Pending',
  },
  {
    id: 10,
    name: 'Brook Carter',
    role: 'Team Lead Dev',
    avatar: 'https://i.pravatar.cc/100?img=10',
    requisitionDate: '25 Nov 2025, 06:34 pm',
    deleteDate: '25 Nov 2025, 06:34 pm',
    reason: 'Privacy concerns',
    status: 'Pending',
  },
];

const StatusBadge = ({ status }) => {
  if (status === 'Rejected') {
    return <span className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">Rejected</span>;
  }
  return <span className="inline-flex items-center px-3 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">Pending</span>;
};

const DeleteAccountRequestPage = () => {
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);

  const filtered = useMemo(() => {
    let list = deleteRequestsData;
    if (filterStatus !== 'All') {
      list = list.filter((r) => r.status === filterStatus);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.role.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q)
      );
    }
    return list;
  }, [query, filterStatus]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Delete Account Request</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                152
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Home › Delete Account Request</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors">
                <Download size={16} />
                Export
                <ChevronDown size={16} />
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg hidden group-hover:block z-10">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">Export as PDF</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-t border-gray-200">Export as Excel</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm bg-white w-full max-w-xs"
          />
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50">
              <Filter size={16} />
              Filter
            </button>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
            <div className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-700">
              1 Dec 25 - 1 Dec 25
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50">
              Sort By
              <ChevronDown size={16} />
            </button>
            <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white hover:bg-gray-50">
              Manage Columns
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-3 px-4 text-left w-8">
                    <input type="checkbox" className="cursor-pointer" />
                  </th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">User Name</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Requisition Date</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Delete Request Date</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Reason for Deletion</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((request) => (
                  <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <input type="checkbox" className="cursor-pointer" />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={request.avatar}
                          alt={request.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{request.name}</p>
                          <p className="text-xs text-gray-500">{request.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{request.requisitionDate}</td>
                    <td className="py-3 px-4 text-gray-600">{request.deleteDate}</td>
                    <td className="py-3 px-4 text-gray-600">{request.reason}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={request.status} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === request.id ? null : request.id)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                        >
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                        {openMenuId === request.id && (
                          <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                              Approve
                            </button>
                            <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-t border-gray-200">
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600">
              Show{' '}
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-gray-300 px-2 py-1 rounded text-sm bg-white"
              >
                <option>10</option>
                <option>25</option>
                <option>50</option>
              </select>{' '}
              entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((s) => Math.max(1, s - 1))}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={page === 1}
              >
                &lt;
              </button>
              <button className="px-3 py-1 bg-red-600 text-white rounded text-sm">{page}</button>
              <button
                onClick={() => setPage((s) => Math.min(pages, s + 1))}
                className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 transition-colors disabled:opacity-50"
                disabled={page === pages}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-6 border-t border-gray-200 bg-white">
        <span>
          Copyright © 2025{' '}
          <span className="text-red-600 font-medium">Preadmin</span>
        </span>
        <div className="flex gap-4 justify-center mt-2">
          <span className="cursor-pointer hover:text-gray-700">About</span>
          <span className="cursor-pointer hover:text-gray-700">Terms</span>
          <span className="cursor-pointer hover:text-gray-700">Contact Us</span>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountRequestPage;
