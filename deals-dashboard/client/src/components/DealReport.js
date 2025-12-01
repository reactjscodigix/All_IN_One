import React, { useState, useMemo } from 'react';
import { Download, Filter, ChevronLeft, ChevronRight, Search, ChevronDown } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const dealReportData = {
  dealsByYear: [
    { month: 'Feb', won: 100, lost: 40 },
    { month: 'Mar', won: 80, lost: 50 },
    { month: 'Apr', won: 100, lost: 40 },
    { month: 'May', won: 80, lost: 45 },
    { month: 'Jun', won: 85, lost: 30 },
    { month: 'Jul', won: 100, lost: 40 },
    { month: 'Aug', won: 90, lost: 35 },
    { month: 'Sep', won: 110, lost: 45 },
    { month: 'Oct', won: 100, lost: 60 },
  ],
  leadsBySource: [
    { name: 'Campaigns', value: 44, color: '#1f93ff' },
    { name: 'Google', value: 55, color: '#6a15ff' },
    { name: 'Referrals', value: 41, color: '#fbbf24' },
    { name: 'Paid Social', value: 17, color: '#ff6b35' },
  ],
  deals: [
    {
      id: 1,
      name: 'Annual Software Subscription',
      stage: 'Appointment',
      value: '$04,51,000',
      tags: ['Rated'],
      expectedClose: '25 Sep 2025',
      probability: '90%',
      status: 'Won',
    },
    {
      id: 2,
      name: 'CRM Onboarding Package',
      stage: 'Appointment',
      value: '$03,12,500',
      tags: ['Collab'],
      expectedClose: '29 Sep 2025',
      probability: '15%',
      status: 'Lost',
    },
    {
      id: 3,
      name: 'Enterprise Plan Upgrade',
      stage: 'Contact Made',
      value: '$04,14,800',
      tags: ['Rejected'],
      expectedClose: '04 Oct 2025',
      probability: '95%',
      status: 'Won',
    },
    {
      id: 4,
      name: 'BrightWorks Campaign',
      stage: 'Presentation',
      value: '$11,14,400',
      tags: ['Rated'],
      expectedClose: '15 Oct 2025',
      probability: '99%',
      status: 'Won',
    },
    {
      id: 5,
      name: 'Sales Pipeline Optimization',
      stage: 'Proposal Made',
      value: '$16,11,400',
      tags: ['Rated'],
      expectedClose: '27 Oct 2025',
      probability: '10%',
      status: 'open',
    },
    {
      id: 6,
      name: 'CRM Migration Project',
      stage: 'Proposal Made',
      value: '$78,11,800',
      tags: ['Rated'],
      expectedClose: '07 Nov 2025',
      probability: '70%',
      status: 'Won',
    },
    {
      id: 7,
      name: 'Multi-Store License Renewal',
      stage: 'Proposal Made',
      value: '$09,05,947',
      tags: ['Promotion'],
      expectedClose: '12 Nov 2025',
      probability: '10%',
      status: 'open',
    },
    {
      id: 8,
      name: 'Custom Feature Development',
      stage: 'Qualify To Buy',
      value: '$04,51,000',
      tags: ['Rejected'],
      expectedClose: '23 Nov 2025',
      probability: '90%',
      status: 'Won',
    },
    {
      id: 9,
      name: 'SkyHigh Annual Booking',
      stage: 'Qualify To Buy',
      value: '$72,14,078',
      tags: ['Collab'],
      expectedClose: '11 Dec 2025',
      probability: '40%',
      status: 'Won',
    },
    {
      id: 10,
      name: 'BlueOcean Funding Round',
      stage: 'Qualify To Buy',
      value: '$09,05,947',
      tags: ['Collab'],
      expectedClose: '17 Dec 2025',
      probability: '47%',
      status: 'Lost',
    },
  ],
};

function DealsByYearChart({ data }) {
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="won" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="lost" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LeadsBySourceChart({ data }) {
  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2}>
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color} />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={36} />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function TagBadge({ tag }) {
  const tagColors = {
    Rated: 'bg-yellow-100 text-yellow-700 border border-yellow-300',
    Collab: 'bg-blue-100 text-blue-700 border border-blue-300',
    Rejected: 'bg-red-100 text-red-700 border border-red-300',
    Promotion: 'bg-red-100 text-red-700 border border-red-300',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${tagColors[tag] || 'bg-gray-100 text-gray-700'}`}>
      {tag}
    </span>
  );
}

function StatusBadge({ status }) {
  const statusColors = {
    Won: 'bg-green-500 text-white',
    Lost: 'bg-red-500 text-white',
    open: 'bg-blue-500 text-white',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[status] || 'bg-gray-500 text-white'}`}>
      {status}
    </span>
  );
}

function DealsTable({ rows }) {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    let tmp = rows.filter((r) => {
      const all = `${r.name} ${r.stage} ${r.value} ${r.status}`.toLowerCase();
      return all.includes(q.toLowerCase());
    });
    return tmp;
  }, [rows, q]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search"
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded text-sm bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-200 rounded text-sm bg-white hover:bg-gray-50 flex items-center gap-2">
            <Filter size={14} /> Filter
          </button>
          <div className="px-4 py-2 border border-gray-200 rounded text-sm bg-white text-gray-700">
            1 Dec 25 - 1 Dec 25
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded text-sm bg-white hover:bg-gray-50 flex items-center gap-2">
            <ChevronDown size={14} /> Sort By
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded text-sm bg-white hover:bg-gray-50 flex items-center gap-2">
            <ChevronDown size={14} /> Manage Columns
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 flex items-center gap-2">
            <Download size={14} /> Download Report
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 text-left w-12">
                <input type="checkbox" className="w-4 h-4" />
              </th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Deal Name</th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Stage</th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Deal Value</th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Tags</th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Expected Close Date</th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Probability</th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <input type="checkbox" className="w-4 h-4" />
                </td>
                <td className="py-3 px-4 text-gray-900 font-medium">{r.name}</td>
                <td className="py-3 px-4 text-gray-700">{r.stage}</td>
                <td className="py-3 px-4 text-gray-900 font-medium">{r.value}</td>
                <td className="py-3 px-4">
                  <div className="flex gap-2">
                    {r.tags.map((tag) => (
                      <TagBadge key={tag} tag={tag} />
                    ))}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-700">{r.expectedClose}</td>
                <td className="py-3 px-4 text-gray-900 font-medium">{r.probability}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show</span>
          <select className="border border-gray-200 rounded px-2 py-1 text-sm">
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-2 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-sm text-gray-600 bg-red-600 text-white px-3 py-1 rounded font-semibold">
            {page}
          </div>
          <button
            disabled={page === pages}
            onClick={() => setPage(page + 1)}
            className="p-2 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

const DealReport = () => {
  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Deal Report</h1>
            <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold">125</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <a href="/" className="text-orange-500 hover:text-orange-600 font-medium">
              Home
            </a>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600">Deal Report</span>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Deals By Year</h2>
              <select className="border border-gray-200 rounded px-3 py-1 text-sm bg-white text-gray-700">
                <option>2025</option>
              </select>
            </div>
            <DealsByYearChart data={dealReportData.dealsByYear} />
          </div>

          {/* Right Column - Donut Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Leads By Source</h2>
              <select className="border border-gray-200 rounded px-3 py-1 text-sm bg-white text-gray-700">
                <option>2025</option>
              </select>
            </div>
            <LeadsBySourceChart data={dealReportData.leadsBySource} />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <DealsTable rows={dealReportData.deals} />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white py-4 text-center">
        <p className="text-xs text-gray-500">
          Copyright © 2025 <span className="font-semibold text-red-600">Preadmin</span>
        </p>
      </div>
    </div>
  );
};

export default DealReport;
