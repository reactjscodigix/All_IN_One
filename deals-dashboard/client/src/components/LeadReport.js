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

const leadReportData = {
  yearBars: [
    { month: 'Jan', value: 400 },
    { month: 'Feb', value: 130 },
    { month: 'Mar', value: 240 },
    { month: 'Apr', value: 450 },
    { month: 'May', value: 250 },
    { month: 'Jun', value: 180 },
    { month: 'Jul', value: 300 },
    { month: 'Aug', value: 240 },
    { month: 'Sep', value: 300 },
    { month: 'Oct', value: 150 },
    { month: 'Nov', value: 250 },
    { month: 'Dec', value: 500 },
  ],
  sourcePie: [
    { name: 'Campaigns', value: 44, color: '#1f93ff' },
    { name: 'Google', value: 55, color: '#6a15ff' },
    { name: 'Referrals', value: 41, color: '#ff3b30' },
    { name: 'Paid Social', value: 17, color: '#ff9800' },
  ],
  leads: [
    {
      id: 1,
      name: 'Elizabeth Morgan',
      avatar: 'https://i.pravatar.cc/100?img=32',
      company: 'NovaWave LLC',
      companySub: 'New York, USA',
      phone: '+1 8754554503',
      status: 'Closed',
      created: '25 Sep 2025, 01:22 pm',
      owner: { name: 'Robert Johnson', avatar: 'https://i.pravatar.cc/100?img=5' },
    },
    {
      id: 2,
      name: 'Katherine Brooks',
      avatar: 'https://i.pravatar.cc/100?img=12',
      company: 'BlueSky Industries',
      companySub: 'Toronto, Canada',
      phone: '+1 9897517485',
      status: 'Not Closed',
      created: '03 Feb 2025, 09:45 AM',
      owner: { name: 'Isabella Cooper', avatar: 'https://i.pravatar.cc/100?img=6' },
    },
    {
      id: 3,
      name: 'Samantha Reed',
      avatar: 'https://i.pravatar.cc/100?img=47',
      company: 'Silver Hawk',
      companySub: 'London, UK',
      phone: '+1 5465525455',
      status: 'Closed',
      created: '14 Mar 2025, 06:10 PM',
      owner: { name: 'John Smith', avatar: 'https://i.pravatar.cc/100?img=7' },
    },
    {
      id: 4,
      name: 'William Anderson',
      avatar: 'https://i.pravatar.cc/100?img=22',
      company: 'Summit Peak',
      companySub: 'Sydney, Australia',
      phone: '+1 4544758787',
      status: 'Contacted',
      created: '29 Apr 2025, 11:00 AM',
      owner: { name: 'Sophia Parker', avatar: 'https://i.pravatar.cc/100?img=8' },
    },
    {
      id: 5,
      name: 'Jonathan Mitchell',
      avatar: 'https://i.pravatar.cc/100?img=3',
      company: 'RiverStone Ltd',
      companySub: 'Berlin, Germany',
      phone: '+1 1245427845',
      status: 'Closed',
      created: '07 May 2025, 04:35 PM',
      owner: { name: 'Ethan Reynolds', avatar: 'https://i.pravatar.cc/100?img=9' },
    },
    {
      id: 6,
      name: 'Jennifer Adams',
      avatar: 'https://i.pravatar.cc/100?img=11',
      company: 'Bright Bridge Grp',
      companySub: 'Tokyo, Japan',
      phone: '+1 4788475447',
      status: 'Closed',
      created: '18 Jun 2025, 08:20 AM',
      owner: { name: 'Liam Carter', avatar: 'https://i.pravatar.cc/100?img=10' },
    },
    {
      id: 7,
      name: 'Alexander Carter',
      avatar: 'https://i.pravatar.cc/100?img=13',
      company: 'CoastalStar Co.',
      companySub: 'Paris, France',
      phone: '+1 2155434845',
      status: 'Closed',
      created: '18 Apr 2025, 08:00 AM',
      owner: { name: 'Noah Mitchell', avatar: 'https://i.pravatar.cc/100?img=14' },
    },
    {
      id: 8,
      name: 'Benjamin Harrison',
      avatar: 'https://i.pravatar.cc/100?img=15',
      company: 'HarborView',
      companySub: 'Dubai, UAE',
      phone: '+1 1211465471',
      status: 'Closed',
      created: '05 Feb 2025, 10:45 AM',
      owner: { name: 'Mason Hayes', avatar: 'https://i.pravatar.cc/100?img=16' },
    },
    {
      id: 9,
      name: 'Nicholas Wright',
      avatar: 'https://i.pravatar.cc/100?img=17',
      company: 'Golden Gate Ltd',
      companySub: 'Mumbai, India',
      phone: '+1 3214554789',
      status: 'Closed',
      created: '15 Jan 2025, 02:02 PM',
      owner: { name: 'Ron Thompson', avatar: 'https://i.pravatar.cc/100?img=18' },
    },
    {
      id: 10,
      name: 'Alexandra Bennett',
      avatar: 'https://i.pravatar.cc/100?img=19',
      company: 'Redwood Inc',
      companySub: 'Tokyo, Japan',
      phone: '+1 2789017145',
      status: 'Lost',
      created: '12 Mar 2025, 08:00 PM',
      owner: { name: 'James Bennett', avatar: 'https://i.pravatar.cc/100?img=20' },
    },
  ],
};

const COLORS = ['#1f93ff', '#6a15ff', '#ff3b30', '#ff9800'];

function StatusBadge({ status }) {
  const map = {
    Closed: 'bg-green-100 text-green-700',
    'Not Closed': 'bg-blue-100 text-blue-700',
    Contacted: 'bg-yellow-100 text-yellow-700',
    Lost: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
}

function LeadsByYearChart({ data }) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#10bdbd" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function LeadsBySourceDonut({ data }) {
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

function LeadsTable({ rows }) {
  const [q, setQ] = useState('');
  const [sortKey, setSortKey] = useState('id');
  const [sortDir, setSortDir] = useState('asc');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    let tmp = rows.filter((r) => {
      const all = `${r.name} ${r.company} ${r.phone} ${r.status}`.toLowerCase();
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
                Lead Name {sortKey === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="py-3 px-4 text-left cursor-pointer font-medium text-gray-700" onClick={() => toggleSort('company')}>
                Company Name {sortKey === 'company' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Phone</th>
              <th className="py-3 px-4 text-left cursor-pointer font-medium text-gray-700" onClick={() => toggleSort('status')}>
                Lead Status {sortKey === 'status' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="py-3 px-4 text-left cursor-pointer font-medium text-gray-700" onClick={() => toggleSort('created')}>
                Created Date {sortKey === 'created' ? (sortDir === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="py-3 px-4 text-left font-medium text-gray-700">Lead Owner</th>
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
                <td className="py-3 px-4 text-gray-700">{r.phone}</td>
                <td className="py-3 px-4">
                  <StatusBadge status={r.status} />
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

const LeadReport = () => {
  return (
    <div className="w-full bg-gray-50 min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Lead Report</h1>
            <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-bold">10+</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <a href="/" className="text-orange-500 hover:text-orange-600 font-medium">
              Home
            </a>
            <span className="text-gray-300">/</span>
            <span className="text-gray-600">Lead Report</span>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Leads By Year</h2>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <select className="border border-gray-200 rounded px-3 py-1 text-sm bg-white">
                  <option>2025</option>
                </select>
              </div>
            </div>
            <LeadsByYearChart data={leadReportData.yearBars} />
          </div>

          {/* Right Column - Donut Chart */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Leads By Source</h2>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <select className="border border-gray-200 rounded px-3 py-1 text-sm bg-white">
                  <option>2025</option>
                </select>
              </div>
            </div>
            <LeadsBySourceDonut data={leadReportData.sourcePie} />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <LeadsTable rows={leadReportData.leads} />
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

export default LeadReport;
