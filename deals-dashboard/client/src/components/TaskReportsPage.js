import React, { useState } from 'react';
import {
  Download,
  Filter,
  Search,
  ChevronDown,
  MoreVertical,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const taskReportData = {
  yearLine: [
    { month: 'Jan', value: 35000 },
    { month: 'Feb', value: 20000 },
    { month: 'Mar', value: 50000 },
    { month: 'Apr', value: 30000 },
    { month: 'May', value: 45000 },
    { month: 'Jun', value: 40000 },
    { month: 'Jul', value: 38000 },
    { month: 'Aug', value: 50000 },
    { month: 'Sep', value: 60000 },
    { month: 'Oct', value: 33000 },
    { month: 'Nov', value: 28000 },
    { month: 'Dec', value: 24000 },
  ],
  typeData: [
    { name: 'Campaigns', value: 44, color: '#0ea5e9' },
    { name: 'Google', value: 55, color: '#6366f1' },
    { name: 'Referrals', value: 41, color: '#ef4444' },
    { name: 'Paid Social', value: 17, color: '#f59e0b' },
  ],
  tasks: [
    {
      id: 1,
      color: 'blue',
      title: 'Add a form to Update Task',
      tags: ['Calls', 'Pending'],
      category: 'Promotion',
      date: '25 Apr 2025',
      avatar: 'https://i.pravatar.cc/32?img=1',
    },
    {
      id: 2,
      color: 'blue',
      title: 'Make all strokes thinner',
      tags: ['Email', 'Pending'],
      category: 'Rejected',
      date: '25 Apr 2025',
      avatar: 'https://i.pravatar.cc/32?img=2',
    },
    {
      id: 3,
      color: 'yellow',
      title: 'Update original content',
      tags: ['Calls', 'Inprogress'],
      category: 'Promotion',
      date: '25 Apr 2025',
      avatar: 'https://i.pravatar.cc/32?img=3',
    },
    {
      id: 4,
      color: 'yellow',
      title: 'Use only component colours',
      tags: ['Task', 'Inprogress'],
      category: 'Collab',
      date: '25 Apr 2025',
      avatar: 'https://i.pravatar.cc/32?img=4',
    },
  ],
  yesterday: [
    {
      id: 5,
      color: 'yellow',
      title: 'Add images to the cards section',
      tags: ['Calls', 'Inprogress'],
      category: 'Promotion',
      date: '24 Apr 2025',
      avatar: 'https://i.pravatar.cc/32?img=5',
    },
    {
      id: 6,
      color: 'red',
      title: 'Add images to the cards section',
      tags: ['Calls', 'Rejected'],
      category: 'Promotion',
      date: '25 Apr 2025',
      avatar: 'https://i.pravatar.cc/32?img=6',
    },
  ],
  apr23: [
    {
      id: 7,
      color: 'yellow',
      title: 'Design description banner & landing page',
      tags: ['Task', 'Inprogress'],
      category: 'Collab',
      date: '23 Apr 2025',
      avatar: 'https://i.pravatar.cc/32?img=7',
    },
    {
      id: 8,
      color: 'green',
      title: 'Make all strokes thinner',
      tags: ['Email', 'Completed'],
      category: 'Promotion',
      date: '23 Apr 2025',
      avatar: 'https://i.pravatar.cc/32?img=8',
    },
  ],
  apr22: [
    {
      id: 9,
      color: 'green',
      title: 'Make all strokes thinner',
      tags: ['Meeting', 'Completed'],
      category: 'Rejected',
      date: '22 Apr 2025',
      avatar: 'https://i.pravatar.cc/32?img=9',
    },
  ],
};

const TaskReportsPage = () => {
  const [query, setQuery] = useState('');
  const [year, setYear] = useState('2025');

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

  const getBorderColor = (color) => {
    const colors = {
      blue: 'border-blue-400',
      red: 'border-red-400',
      yellow: 'border-yellow-400',
      green: 'border-green-400'
    };
    return colors[color] || 'border-gray-400';
  };

  const TaskItem = ({ task }) => (
    <div className={`bg-white border-l-4 ${getBorderColor(task.color)} rounded-md p-4 flex justify-between items-center hover:shadow-md transition-shadow border border-gray-200`}>
      <div className="flex items-center gap-3 flex-1">
        <input type="checkbox" className="cursor-pointer" />
        <span className="text-gray-400 cursor-move">≡</span>
        <span className="font-medium text-sm text-gray-900">{task.title}</span>
        <div className="flex gap-2">
          {task.tags.map((tag, i) => (
            <span key={i} className={`text-xs px-2 py-0.5 rounded ${getTagColor(tag)}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 ml-4">
        <span className={`px-3 py-1 rounded text-xs font-medium ${getCategoryColor(task.category)}`}>
          {task.category}
        </span>
        <span className="text-sm text-gray-500 whitespace-nowrap">{task.date}</span>
        <img src={task.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
          <MoreVertical size={16} className="text-gray-400" />
        </button>
      </div>
    </div>
  );

  const TaskGroup = ({ title, count, tasks: groupTasks }) => (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-gray-700 font-semibold text-sm">{title}</h3>
        {count && <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-semibold">{count}</span>}
      </div>
      <div className="space-y-2">
        {groupTasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">Task Reports</h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                120
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Home › Task Reports</p>
          </div>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2">
            <Download size={16} />
            Download Report
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Tasks By Year Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Tasks By Year</h3>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-600">
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              <TasksByYearChart data={taskReportData.yearLine} />
            </div>

            {/* Tasks By Type Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-900">Tasks By Type</h3>
                <select className="text-sm border border-gray-300 rounded px-2 py-1 text-gray-600">
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </div>
              <TasksByTypeChart data={taskReportData.typeData} />
            </div>
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm bg-white"
                  />
                </div>
                <select className="border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-600 bg-white hover:border-gray-400">
                  <option>All Tasks</option>
                  <option>Recent</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
                <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                  <Filter size={16} /> Filter
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>📅</span>
                  <span>1 Dec 25 - 1 Dec 25</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                  Mark all as read
                </button>
                <button className="border border-gray-300 px-3 py-2 rounded-lg text-gray-600 text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                  Sort By <ChevronDown size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Tasks Groups */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <TaskGroup title="Recent" count={24} tasks={taskReportData.tasks} />
            <TaskGroup title="Yesterday" tasks={taskReportData.yesterday} />
            <TaskGroup title="23 Apr 2025" tasks={taskReportData.apr23} />
            <TaskGroup title="22 Apr 2025" tasks={taskReportData.apr22} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-6 border-t border-gray-200 bg-white mt-6">
        <span>Copyright © 2025 <span className="text-red-600 font-medium">Preadmin</span></span>
        <div className="flex gap-4 justify-center mt-2">
          <span className="cursor-pointer hover:text-gray-700">About</span>
          <span className="cursor-pointer hover:text-gray-700">Terms</span>
          <span className="cursor-pointer hover:text-gray-700">Contact Us</span>
        </div>
      </div>
    </div>
  );
};

function TasksByYearChart({ data }) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 30, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
          <YAxis tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)} tick={{ fontSize: 12, fill: '#6B7280' }} />
          <Tooltip formatter={(v) => new Intl.NumberFormat().format(v)} />
          <Line type="monotone" dataKey="value" stroke="#1e40af" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function TasksByTypeChart({ data }) {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} innerRadius={60} outerRadius={95} dataKey="value" paddingAngle={3}>
            {data.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={30} />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TaskReportsPage;
