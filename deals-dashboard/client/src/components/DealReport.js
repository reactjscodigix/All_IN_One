import React, { useState, useMemo } from 'react';
import { Calendar, Download, Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';
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
  yearBars: [
    { month: 'Jan', value: 350 },
    { month: 'Feb', value: 200 },
    { month: 'Mar', value: 280 },
    { month: 'Apr', value: 420 },
    { month: 'May', value: 310 },
    { month: 'Jun', value: 220 },
    { month: 'Jul', value: 380 },
    { month: 'Aug', value: 290 },
    { month: 'Sep', value: 340 },
    { month: 'Oct', value: 180 },
    { month: 'Nov', value: 290 },
    { month: 'Dec', value: 520 },
  ],
  stagePie: [
    { name: 'Prospecting', value: 35, color: '#1f93ff' },
    { name: 'Negotiation', value: 45, color: '#6a15ff' },
    { name: 'Won', value: 50, color: '#10b981' },
    { name: 'Lost', value: 25, color: '#ff3b30' },
  ],
  deals: [
    {
      id: 1,
      name: 'Tech Solutions Contract',
      avatar: 'https://i.pravatar.cc/100?img=32',
      company: 'TechCore Inc',
      companySub: 'San Francisco, USA',
      amount: '$45,000',
      stage: 'Won',
      created: '20 Sep 2025, 02:15 pm',
      owner: { name: 'Robert Johnson', avatar: 'https://i.pravatar.cc/100?img=5' },
    },
    {
      id: 2,
      name: 'Enterprise Software License',
      avatar: 'https://i.pravatar.cc/100?img=12',
      company: 'Global Tech Ltd',
      companySub: 'London, UK',
      amount: '$120,000',
      stage: 'Negotiation',
      created: '10 Feb 2025, 10:30 AM',
      owner: { name: 'Isabella Cooper', avatar: 'https://i.pravatar.cc/100?img=6' },
    },
    {
      id: 3,
      name: 'Cloud Infrastructure',
      avatar: 'https://i.pravatar.cc/100?img=47',
      company: 'CloudVentures',
      companySub: 'Berlin, Germany',
      amount: '$85,500',
      stage: 'Won',
      created: '25 Mar 2025, 03:45 PM',
      owner: { name: 'John Smith', avatar: 'https://i.pravatar.cc/100?img=7' },
    },
    {
      id: 4,
      name: 'Digital Marketing Suite',
      avatar: 'https://i.pravatar.cc/100?img=22',
      company: 'MarketPro Solutions',
      companySub: 'Toronto, Canada',
      amount: '$32,000',
      stage: 'Prospecting',
      created: '01 May 2025, 09:20 AM',
      owner: { name: 'Sophia Parker', avatar: 'https://i.pravatar.cc/100?img=8' },
    },
    {
      id: 5,
      name: 'Data Analytics Platform',
      avatar: 'https://i.pravatar.cc/100?img=3',
      company: 'Analytics Pro',
      companySub: 'Austin, USA',
      amount: '$95,000',
      stage: 'Won',
      created: '12 Jun 2025, 11:50 AM',
      owner: { name: 'Ethan Reynolds', avatar: 'https://i.pravatar.cc/100?img=9' },
    },
    {
      id: 6,
      name: 'Security Framework',
      avatar: 'https://i.pravatar.cc/100?img=11',
      company: 'SecureNet Inc',
      companySub: 'Singapore',
      amount: '$68,500',
      stage: 'Negotiation',
      created: '08 Jul 2025, 02:30 PM',
      owner: { name: 'Liam Carter', avatar: 'https://i.pravatar.cc/100?img=10' },
    },
    {
      id: 7,
      name: 'Mobile App Development',
      avatar: 'https://i.pravatar.cc/100?img=13',
      company: 'AppCreators Ltd',
      companySub: 'Sydney, Australia',
      amount: '$55,000',
      stage: 'Prospecting',
      created: '15 Apr 2025, 04:15 PM',
      owner: { name: 'Noah Mitchell', avatar: 'https://i.pravatar.cc/100?img=14' },
    },
    {
      id: 8,
      name: 'Enterprise Support Package',
      avatar: 'https://i.pravatar.cc/100?img=15',
      company: 'SupportPro',
      companySub: 'Tokyo, Japan',
      amount: '$38,000',
      stage: 'Lost',
      created: '22 Feb 2025, 01:00 PM',
      owner: { name: 'Mason Hayes', avatar: 'https://i.pravatar.cc/100?img=16' },
    },
    {
      id: 9,
      name: 'AI Integration Services',
      avatar: 'https://i.pravatar.cc/100?img=17',
      company: 'AI Systems Corp',
      companySub: 'New York, USA',
      amount: '$150,000',
      stage: 'Negotiation',
      created: '10 Jan 2025, 08:45 AM',
      owner: { name: 'Ron Thompson', avatar: 'https://i.pravatar.cc/100?img=18' },
    },
    {
      id: 10,
      name: 'Custom CRM Solution',
      avatar: 'https://i.pravatar.cc/100?img=19',
      company: 'CRM Innovators',
      companySub: 'Dubai, UAE',
      amount: '$72,500',
      stage: 'Lost',
      created: '05 Mar 2025, 03:30 PM',
      owner: { name: 'James Bennett', avatar: 'https://i.pravatar.cc/100?img=20' },
    },
  ],
};

const COLORS = ['#1f93ff', '#6a15ff', '#10b981', '#ff3b30'];

function StageBadge({ stage }) {
  const map = {
    Won: 'bg-green-100 text-green-700',
    Negotiation: 'bg-purple-100 text-purple-700',
    Prospecting: 'bg-blue-100 text-blue-700',
    Lost: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${map[stage] || 'bg-gray-100 text-gray-700'}`}>
      {stage}
    </span>
  );
}

function DealsByYearChart({ data }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function DealsByStageDonut({ data }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4}>
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={entry.color || COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={36} />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function DealsTable({ rows }) {
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    let tmp = rows.filter((r) => {
      const all = `${r.name} ${r.company} ${r.amount} ${r.stage}`.toLowerCase();
      return all.includes(q.toLowerCase());
    });
    tmp = tmp.sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (sortKey === 'created') {
        av = a.created;
        bv = b.created;
      }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return tmp;
  }, [rows, q, sortKey, sortDir]);

  const total = filtered.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const pageData = filtered.slice((page - 1) * perPage, page * perPage);

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
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
          <button className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 flex items-center gap-2">
            <Download size={14} /> Download Report
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-3 px-4 text-left">
                <input type="checkbox" className="w-4 h-4" />
              </th>
              <th className="py-3 px-4 text-left cursor-pointer font-medium text-gray-700" onClick={() => toggleSort('name')}>
                Deal Name {sortKey === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="py-3 px-4 text-left cursor-pointer font-medium text-gray-700" onClick={() => toggleSort('company')}>
                Company Name {sortKey === 'company' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Amount</th>
              <th className="py-3 px-4 text-left cursor-pointer font-medium text-gray-700" onClick={() => toggleSort('stage')}>
                Deal Stage {sortKey === 'stage' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="py-3 px-4 text-left cursor-pointer font-medium text-gray-700" onClick={() => toggleSort('created')}>
                Created Date {sortKey === 'created' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Deal Owner</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((r) => (
              <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <input type="checkbox" className="w-4 h-4" />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img src={r.avatar} alt={r.name} className="w-8 h-8 rounded-full object-cover" />
                    <span className="font-medium text-gray-900">{r.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-700">
                      {r.company.charAt(0)}
                    </div>
                    <div>
                      <div className="text-gray-900">{r.company}</div>
                      <div className="text-xs text-gray-500">{r.companySub}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 font-medium text-gray-900">{r.amount}</td>
                <td className="py-3 px-4">
                  <StageBadge stage={r.stage} />
                </td>
                <td className="py-3 px-4 text-gray-700">{r.created}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <img src={r.owner.avatar} alt={r.owner.name} className="w-7 h-7 rounded-full object-cover" />
                    <span className="text-gray-900">{r.owner.name}</span>
                  </div>
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
          <div className="text-sm text-gray-600">
            Page {page} of {pages}
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
            <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold">8+</span>
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Deals By Year</h2>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <select className="border border-gray-200 rounded px-3 py-1 text-sm bg-white">
                  <option>2025</option>
                </select>
              </div>
            </div>
            <DealsByYearChart data={dealReportData.yearBars} />
          </div>

          {/* Right Column - Donut Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Deals By Stage</h2>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <select className="border border-gray-200 rounded px-3 py-1 text-sm bg-white">
                  <option>2025</option>
                </select>
              </div>
            </div>
            <DealsByStageDonut data={dealReportData.stagePie} />
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
