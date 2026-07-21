import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  GitBranch, Github, Search, Plus, GitPullRequest, CircleDot,
  Clock, CheckCircle, AlertCircle, RefreshCw, Filter, MoreVertical,
  Activity, ArrowUpRight, FolderGit2, ChevronDown, Download, Lock, Globe,
  ActivitySquare, ArrowUp, ExternalLink, Settings, Webhook, ChevronRight,
  GitCommit, Check, ChevronLeft, GitMerge, FilePlus, PlayCircle, Code, X, Info
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// We fetch repositories from the backend, so we no longer need the hardcoded MOCK_REPOS
// But we keep the static widgets and charts the same for now.

const RECENT_ACTIVITY = [];

const LANG_DATA = [];

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'];

const CustomSelect = ({ value, onChange, options, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 hover:border-gray-300 transition-colors focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
      >
        <span className="truncate mr-2">{value}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto py-1 text-left">
          {options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${value === option ? 'bg-indigo-50 text-[#4F46E5] font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ITRepositoriesPage() {
  const [repositories, setRepositories] = useState([]);
  const [selectedRepo, setSelectedRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);

  // Import form state
  const [deleting, setDeleting] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importProject, setImportProject] = useState('None');
  const [importVisibility, setImportVisibility] = useState('Public');
  const [importToken, setImportToken] = useState('');

  // Details panel flow state
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [githubOrg, setGithubOrg] = useState('codigix-infotech');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showContributorsModal, setShowContributorsModal] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedLanguage, setSelectedLanguage] = useState('All Languages');
  const [selectedVisibility, setSelectedVisibility] = useState('All Visibility');
  const [selectedStatus, setSelectedStatus] = useState('All Status');

  const fetchRepositories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/github/repositories');
      // If topics is a string, parse it
      const processedRepos = response.data.map(repo => ({
        ...repo,
        topics: typeof repo.topics === 'string' ? JSON.parse(repo.topics) : (repo.topics || []),
        contributors: typeof repo.contributors === 'string' ? JSON.parse(repo.contributors) : (repo.contributors || []),
        isPrivate: repo.is_private === 1 || repo.is_private === true
      }));
      setRepositories(processedRepos);
      if (processedRepos.length > 0 && !selectedRepo) {
        setSelectedRepo(processedRepos[0]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const handleDeleteRepo = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this repository from the dashboard?')) {
      return;
    }
    setDeleting(true);
    try {
      await axios.delete(`http://localhost:5000/api/github/repositories/${id}`);
      setSelectedRepo(null);
      setShowSettingsModal(false);
      await fetchRepositories();
    } catch (error) {
      console.error('Error deleting repository:', error);
      alert('Failed to delete repository');
    }
    setDeleting(false);
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await axios.post('http://localhost:5000/api/github/sync');
      await fetchRepositories();
    } catch (error) {
      console.error('Error syncing:', error);
    }
    setSyncing(false);
  };

  const handleImport = async () => {
    if (!importUrl) {
      alert("Please enter a GitHub Clone URL");
      return;
    }
    setImporting(true);
    try {
      await axios.post('http://localhost:5000/api/github/import', {
        url: importUrl,
        project: importProject !== 'None' ? importProject : null,
        isPrivate: importVisibility === 'Private',
        token: importToken
      });
      await fetchRepositories();
      setShowImportModal(false);
      // Reset form
      setImportUrl('');
      setImportProject('None');
      setImportVisibility('Public');
      setImportToken('');
    } catch (error) {
      console.error('Error importing:', error);
      alert(error.response?.data?.error || "Failed to import repository");
    }
    setImporting(false);
  };

  const openInGitHub = () => {
    if (selectedRepo) {
      window.open(`https://github.com/${selectedRepo.full_name || selectedRepo.fullName}`, '_blank');
    }
  };

  // Derived metrics
  const totalRepos = repositories.length;
  const privateRepos = repositories.filter(r => r.isPrivate).length;
  const publicRepos = totalRepos - privateRepos;
  const activeRepos = repositories.filter(r => r.status === 'Active').length;

  // Filtered array for table
  const filteredRepos = repositories.filter(repo => {
    if (searchQuery && !repo.name.toLowerCase().includes(searchQuery.toLowerCase()) && !repo.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedProject !== 'All Projects' && repo.project !== selectedProject) return false;
    if (selectedLanguage !== 'All Languages' && repo.language !== selectedLanguage) return false;
    if (selectedVisibility !== 'All Visibility') {
      const isPriv = selectedVisibility === 'Private';
      if (repo.isPrivate !== isPriv) return false;
    }
    if (selectedStatus !== 'All Status' && repo.status !== selectedStatus) return false;
    return true;
  });

  const renderBadge = (isPrivate) => (
    <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded ${isPrivate ? 'text-amber-700 bg-amber-50 border border-amber-200' : 'text-emerald-700 bg-emerald-50 border border-emerald-200'}`}>
      {isPrivate ? <Lock size={10} /> : <Globe size={10} />}
      {isPrivate ? 'Private' : 'Public'}
    </span>
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-gray-900 pb-10">

      {/* Top Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10 ">
        <div>
          <h1 className="text-2xl  text-gray-900 tracking-tight">Repositories</h1>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
            <span className="hover:text-blue-600 cursor-pointer">Dashboard</span>
            <ChevronRight size={12} />
            <span className="text-gray-700 font-medium">Repositories</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className={`flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md  text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors ${syncing ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} /> {syncing ? 'Syncing...' : 'Sync Now'}
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md  text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
          >
            <Download size={14} /> Import Repository
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-[#4F46E5] text-white rounded-md  hover:bg-indigo-600 text-sm font-medium transition-colors"
          >
            <Plus size={14} /> Add Repository
          </button>
        </div>
      </div>

      <div className="p-4  mx-auto space-y-2">

        {/* KPI Cards row */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded border border-gray-200  col-span-1">
            <div className="flex items-start gap-3">
              <Github size={24} className="text-gray-900 mt-1" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">GitHub Integration</p>
                <p className="text-[11px] text-gray-500 mb-2">Connected to <strong>{githubOrg}</strong></p>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] rounded-md font-medium">● Connected</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowConnectionModal(true)}
              className="mt-3 w-full py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
            >
              Manage Connection
            </button>
          </div>

          <div className="bg-white p-4 rounded border border-gray-200  flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-purple-50 flex items-center justify-center flex-shrink-0">
              <FolderGit2 size={24} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Total Repositories</p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl  text-gray-900 leading-none">{totalRepos}</h3>
                <span className="flex items-center text-[11px] font-medium text-emerald-600 mb-0.5">
                  <ArrowUp size={12} /> 12% <span className="text-gray-400 ml-1">vs last month</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border border-gray-200  flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Lock size={24} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Private</p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl  text-gray-900 leading-none">{privateRepos}</h3>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">{totalRepos > 0 ? ((privateRepos / totalRepos) * 100).toFixed(1) : 0}% of total</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded border border-gray-200  flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <Globe size={24} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Public</p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl  text-gray-900 leading-none">{publicRepos}</h3>
              </div>
              <p className="text-[11px] text-gray-500 mt-1">{totalRepos > 0 ? ((publicRepos / totalRepos) * 100).toFixed(1) : 0}% of total</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded border border-gray-200  flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-blue-50 flex items-center justify-center flex-shrink-0">
              <ActivitySquare size={24} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Active Repositories</p>
              <div className="flex items-end gap-2">
                <h3 className="text-2xl  text-gray-900 leading-none">{activeRepos}</h3>
                <span className="flex items-center text-[11px] font-medium text-emerald-600 mb-0.5">
                  <ArrowUp size={12} /> 8% <span className="text-gray-400 ml-1">vs last month</span>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border border-gray-200  flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
              <RefreshCw size={24} className="text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1">Last Sync</p>
              <h3 className="text-lg  text-gray-900 leading-none mb-1">2 mins ago</h3>
              <p className="text-[10px] text-gray-400">May 30, 2026 10:45 AM</p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[250px]">
            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repositories..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] transition-shadow "
            />
          </div>

          <CustomSelect
            value={selectedProject}
            onChange={setSelectedProject}
            options={['All Projects', 'Hospital ERP', 'CRM System', 'Mobile App', 'Website', 'DevOps']}
            className="min-w-[140px]"
          />

          <CustomSelect
            value={selectedLanguage}
            onChange={setSelectedLanguage}
            options={['All Languages', 'TypeScript', 'JavaScript', 'React', 'React Native', 'Node.js', 'Vue', 'Shell', 'Next.js']}
            className="min-w-[140px]"
          />

          <CustomSelect
            value={selectedVisibility}
            onChange={setSelectedVisibility}
            options={['All Visibility', 'Private', 'Public']}
            className="min-w-[140px]"
          />

          <CustomSelect
            value={selectedStatus}
            onChange={setSelectedStatus}
            options={['All Status', 'Active', 'Archived']}
            className="min-w-[120px]"
          />

          <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-md  text-[#4F46E5] hover:bg-gray-50 text-sm font-medium transition-colors">
            <Filter size={14} /> More Filters
          </button>

          <button onClick={handleSync} className="p-2 bg-white border border-gray-200 rounded-md  text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} className={syncing ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Main Content Split */}
        <div className="flex flex-col xl:flex-row gap-2 items-start">

          {/* Left Column (Table + Bottom Widgets) */}
          <div className="flex-1 w-full space-y-6 min-w-0">

            {/* Table Card */}
            <div className="bg-white border border-gray-200 rounded  overflow-hidden flex flex-col">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      <th className="py-3 px-4 font-semibold">Repository</th>
                      <th className="py-3 px-4 font-semibold">Project</th>
                      <th className="py-3 px-4 font-semibold">Visibility</th>
                      <th className="py-3 px-4 font-semibold">Language</th>
                      <th className="py-3 px-4 font-semibold">Stars ↓</th>
                      <th className="py-3 px-4 font-semibold text-center">Forks</th>
                      <th className="py-3 px-4 font-semibold text-center">Open PRs</th>
                      <th className="py-3 px-4 font-semibold">Last Commit</th>
                      <th className="py-3 px-4 font-semibold">Updated</th>
                      <th className="py-3 px-4 font-semibold text-center">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {loading ? (
                      <tr>
                        <td colSpan="11" className="py-12 text-center text-gray-500">
                          <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-[#4F46E5]" />
                          Loading repositories...
                        </td>
                      </tr>
                    ) : filteredRepos.length === 0 ? (
                      <tr>
                        <td colSpan="11" className="py-12 text-center text-gray-500">
                          No repositories found matching your filters.
                        </td>
                      </tr>
                    ) : filteredRepos.map(repo => (
                      <tr
                        key={repo.id}
                        onClick={() => setSelectedRepo(repo)}
                        className={`hover:bg-blue-50/50 transition-colors cursor-pointer ${selectedRepo?.id === repo.id ? 'bg-blue-50/50' : 'bg-white'}`}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-3">
                            <Github size={18} className="text-gray-900 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-semibold text-[#4F46E5] text-sm hover:underline">{repo.name}</p>
                              <p className="text-[11px] text-gray-500 line-clamp-1">{repo.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-medium text-xs">{repo.project}</td>
                        <td className="py-3 px-4">
                          {renderBadge(repo.isPrivate)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded text-[10px] flex items-center justify-center  text-white " style={{ backgroundColor: repo.language_color || repo.languageColor || '#999' }}>
                              {(repo.language || 'U').charAt(0)}
                            </span>
                            <span className="text-[#3178C6] font-medium text-xs">{repo.language}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-medium">{repo.stars}</td>
                        <td className="py-3 px-4 text-gray-600 text-center">{repo.forks}</td>
                        <td className="py-3 px-4 text-gray-600 text-center">{repo.open_prs || repo.openPRs || 0}</td>
                        <td className="py-3 px-4">
                          <p className="text-xs text-gray-700 line-clamp-1">{repo.last_commit_msg || repo.lastCommitMsg}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{repo.last_commit_hash || repo.lastCommitHash}</p>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">{repo.last_update || repo.lastUpdate}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded ${repo.status === 'Active' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-gray-700 bg-gray-50 border border-gray-200'}`}>
                            {repo.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button className="p-1 text-gray-400 hover:text-[#4F46E5] hover:bg-indigo-50 rounded transition-colors" title="View Analytics">
                              <Activity size={16} />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors">
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-3 border-t border-gray-200 bg-white flex items-center justify-between">
                <span className="text-xs text-gray-500">Showing {filteredRepos.length > 0 ? 1 : 0} to {Math.min(10, filteredRepos.length)} of {filteredRepos.length} repositories</span>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded text-gray-400 hover:bg-gray-100" disabled><ChevronLeft size={16} /></button>
                    <button className="w-7 h-7 rounded text-xs font-medium bg-[#4F46E5] text-white">1</button>
                    <button className="w-7 h-7 rounded text-xs font-medium text-gray-600 hover:bg-gray-100">2</button>
                    <button className="w-7 h-7 rounded text-xs font-medium text-gray-600 hover:bg-gray-100">3</button>
                    <button className="p-1 rounded text-gray-600 hover:bg-gray-100"><ChevronRight size={16} /></button>
                  </div>
                  <select className="text-xs border border-gray-200 rounded px-2 py-1 outline-none text-gray-600 bg-white">
                    <option>10 / page</option>
                    <option>20 / page</option>
                    <option>50 / page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">

              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded  p-5">
                <h3 className="text-sm  text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {RECENT_ACTIVITY.map(act => (
                    <div key={act.id} className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-md ${act.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <act.icon size={12} className={act.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900">{act.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-gray-500">by {act.user}</span>
                          {act.hash && <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded font-mono">{act.hash}</span>}
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">{act.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Languages */}
              <div className="bg-white border border-gray-200 rounded  p-5 flex flex-col">
                <h3 className="text-sm  text-gray-900 mb-4">Top Languages</h3>
                <div className="flex-1 flex items-center justify-center relative">
                  <div className="w-32 h-32 absolute left-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={LANG_DATA}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={55}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {LANG_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip contentStyle={{ fontSize: '11px', borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="ml-36 w-full space-y-2">
                    {LANG_DATA.map(lang => (
                      <div key={lang.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }}></span>
                          <span className="text-gray-700 font-medium">{lang.name}</span>
                        </div>
                        <span className="text-gray-500">{lang.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Repository Health */}
              <div className="bg-white border border-gray-200 rounded  p-5 flex flex-col">
                <h3 className="text-sm  text-gray-900 mb-4">Repository Health</h3>
                <div className="flex items-center gap-6 mb-4">
                  <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center rounded-full border-[6px] border-emerald-500 border-r-emerald-100">
                    <div className="text-center">
                      <span className="text-xl  text-emerald-600 leading-none">92</span>
                      <p className="text-[10px] text-emerald-600 font-medium">Excellent</p>
                    </div>
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-gray-600">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" /> Repository is up to date
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-600">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" /> No vulnerabilities found
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-600">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" /> CI/CD pipeline active
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-600">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" /> Branch protection enabled
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-600">
                      <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" /> Code coverage: 86%
                    </div>
                  </div>
                </div>
                <button className="mt-auto w-full py-2 text-xs font-semibold text-[#4F46E5] bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors">
                  View Full Report
                </button>
              </div>

            </div>
          </div>

          {/* Right Column (Repository Details Panel) */}
          <div className="w-full xl:w-80 bg-white border border-gray-200 rounded  p-5 flex-shrink-0">
            <h3 className="text-sm  text-gray-900 mb-4 border-b border-gray-100 pb-3">Repository Details</h3>

            {!selectedRepo && !loading && (
              <p className="text-sm text-gray-500">Select a repository to view details.</p>
            )}

            {selectedRepo && (
              <>
                <div className="flex gap-3 mb-4">
                  <Github size={32} className="text-gray-900 mt-1" />
                  <div>
                    <h4 className="text-sm  text-[#4F46E5] hover:underline cursor-pointer break-all leading-tight mb-1" onClick={openInGitHub}>
                      {selectedRepo.name}
                    </h4>
                    <p className="text-[10px] text-gray-500 mb-2 break-all">{selectedRepo.full_name || selectedRepo.fullName}</p>
                    {renderBadge(selectedRepo.isPrivate)}
                  </div>
                </div>

                <div className="mb-5">
                  <p className="text-xs text-gray-900 font-semibold mb-1">Description</p>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {selectedRepo.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-xs text-gray-500">Language</span>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-900">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedRepo.language_color || selectedRepo.languageColor || '#999' }}></span>
                      {selectedRepo.language || 'Unknown'}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-xs text-gray-500">Default Branch</span>
                    <span className="text-xs font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{selectedRepo.active_branch || selectedRepo.activeBranch || 'main'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-xs text-gray-500">Created On</span>
                    <span className="text-xs font-medium text-gray-900">{selectedRepo.created_on || selectedRepo.createdOn || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                    <span className="text-xs text-gray-500">Last Commit</span>
                    <span className="text-xs font-medium text-gray-900">{selectedRepo.last_update || selectedRepo.lastUpdate || 'Unknown'}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs text-gray-900 font-semibold">Contributors</p>
                    {selectedRepo.contributors?.length > 0 && (
                      <button onClick={() => setShowContributorsModal(true)} className="text-[10px] text-[#4F46E5] hover:underline font-medium">View All</button>
                    )}
                  </div>
                  <div onClick={() => setShowContributorsModal(true)} className="flex items-center -space-x-2 cursor-pointer group hover:scale-105 transition-transform origin-left">
                    {selectedRepo.contributors && selectedRepo.contributors.length > 0 ? (
                      <>
                        {selectedRepo.contributors.slice(0, 4).map((c, idx) => (
                          <div key={idx} className={`w-7 h-7 rounded-full ${c.color || 'bg-gray-100 text-gray-700'} border-2 border-white flex items-center justify-center text-[10px]  z-${40 - idx * 10} transition-colors`} title={`${c.name} (${c.commits} commits)`}>
                            {c.name ? c.name.substring(0, 2).toUpperCase() : 'U'}
                          </div>
                        ))}
                        {selectedRepo.contributors.length > 4 && (
                          <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px]  text-gray-600 z-0 hover:bg-gray-200 transition-colors">
                            +{selectedRepo.contributors.length - 4}
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-[10px] text-gray-400">No contributors data</span>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-xs text-gray-900 font-semibold mb-2">Topics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(selectedRepo.topics) && selectedRepo.topics.map(topic => (
                      <span key={topic} className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] rounded-md font-medium">
                        {topic}
                      </span>
                    ))}
                    {(!selectedRepo.topics || selectedRepo.topics.length === 0) && (
                      <span className="text-[10px] text-gray-400">No topics</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <button onClick={openInGitHub} className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#4F46E5] hover:bg-indigo-50 rounded-md transition-colors border border-transparent hover:border-indigo-100 group">
                    <div className="flex items-center gap-2"><ExternalLink size={14} /> Open in GitHub</div>
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button onClick={() => setShowSettingsModal(true)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#4F46E5] hover:bg-indigo-50 rounded-md transition-colors border border-transparent hover:border-indigo-100 group">
                    <div className="flex items-center gap-2"><Settings size={14} /> Repository Settings</div>
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button onClick={() => setShowWebhookModal(true)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#4F46E5] hover:bg-indigo-50 rounded-md transition-colors border border-transparent hover:border-indigo-100 group">
                    <div className="flex items-center gap-2"><Webhook size={14} /> Webhook Setup</div>
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Add Repository Modal (GitHub Standard Format) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded shadow-xl w-full max-w-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-900 font-semibold text-lg">
                Create a new repository
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="text-sm text-gray-500 mb-2">
                A repository contains all project files, including the revision history. Already have a project repository elsewhere? <a href="#" onClick={(e) => { e.preventDefault(); setShowAddModal(false); setShowImportModal(true); }} className="text-[#4F46E5] hover:underline">Import a repository.</a>
              </div>

              <div className="flex items-end gap-2 pb-4 border-b border-gray-200">
                <div className="flex-1 max-w-[200px]">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Owner <span className="text-red-500">*</span></label>
                  <select className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md  focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] text-sm font-medium text-gray-700">
                    <option>codigix-infotech</option>
                    <option>your-username</option>
                  </select>
                </div>
                <div className="text-gray-400 text-xl font-light px-1 pb-1.5">/</div>
                <div className="flex-[2]">
                  <label className="block text-sm font-medium text-gray-900 mb-1">Repository name <span className="text-red-500">*</span></label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md  focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] text-sm font-medium" />
                </div>
              </div>

              <div className="text-[13px] text-gray-500 mt-[-16px]">
                Great repository names are short and memorable. Need inspiration? How about <span className="font-semibold text-gray-700">scaling-octo-broccoli</span>?
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md  focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] text-sm" />
              </div>

              <div className="pt-2 pb-4 border-b border-gray-200">
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="radio" name="visibility" className="mt-1 h-4 w-4 text-[#4F46E5] border-gray-300 focus:ring-[#4F46E5]" defaultChecked />
                    <div>
                      <span className="block text-sm font-semibold text-gray-900 flex items-center gap-1.5"><Globe size={16} className="text-gray-400 group-hover:text-emerald-600 transition-colors" /> Public</span>
                      <span className="block text-xs text-gray-500 mt-1">Anyone on the internet can see this repository. You choose who can commit.</span>
                    </div>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input type="radio" name="visibility" className="mt-1 h-4 w-4 text-[#4F46E5] border-gray-300 focus:ring-[#4F46E5]" />
                    <div>
                      <span className="block text-sm font-semibold text-gray-900 flex items-center gap-1.5"><Lock size={16} className="text-gray-400 group-hover:text-amber-600 transition-colors" /> Private</span>
                      <span className="block text-xs text-gray-500 mt-1">You choose who can see and commit to this repository.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="pt-2 pb-2">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Initialize this repository with:</h3>
                <p className="text-xs text-gray-500 mb-4">Skip this step if you're importing an existing repository.</p>

                <div className="space-y-4">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" className="mt-0.5 h-4 w-4 text-[#4F46E5] border-gray-300 rounded focus:ring-[#4F46E5]" defaultChecked />
                    <div>
                      <span className="text-sm font-semibold text-gray-900 block">Add a README file</span>
                      <span className="text-xs text-gray-500 block">This is where you can write a long description for your project. <a href="#" className="text-[#4F46E5] hover:underline">Learn more.</a></span>
                    </div>
                  </label>

                  <div className="pl-6 space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-900 block mb-1">Add .gitignore</label>
                      <p className="text-xs text-gray-500 mb-2">Choose which files not to track from a list of templates. <a href="#" className="text-[#4F46E5] hover:underline">Learn more.</a></p>
                      <select className="w-full max-w-[300px] px-3 py-2 bg-gray-50 border border-gray-300 rounded-md  focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] text-sm text-gray-700">
                        <option>None</option>
                        <option>Node</option>
                        <option>React</option>
                        <option>Python</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-gray-900 block mb-1">Choose a license</label>
                      <p className="text-xs text-gray-500 mb-2">A license tells others what they can and can't do with your code. <a href="#" className="text-[#4F46E5] hover:underline">Learn more.</a></p>
                      <select className="w-full max-w-[300px] px-3 py-2 bg-gray-50 border border-gray-300 rounded-md  focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] text-sm text-gray-700">
                        <option>None</option>
                        <option>MIT License</option>
                        <option>Apache License 2.0</option>
                        <option>GNU General Public License v3.0</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Info size={14} className="text-gray-400" />
                    This will set <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-800">main</span> as the default branch.
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-md  text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">Cancel</button>
              <button className="px-4 py-2 border border-transparent rounded-md  text-sm font-semibold text-white bg-[#1F883D] hover:bg-[#1a7032] transition-colors flex items-center gap-2">
                Create repository
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Repository Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded shadow-xl w-full max-w-lg border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Download size={18} className="text-[#4F46E5]" />
                Import Repository from GitHub
              </div>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-md flex items-start gap-3 text-blue-800 text-sm">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <p>Importing will create a local reference to an existing GitHub repository, allowing you to sync commits, PRs, and issues directly to this dashboard.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Clone URL <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Github size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="url"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="https://github.com/username/repository.git"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md  focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Assignment (Optional)</label>
                  <CustomSelect
                    value={importProject}
                    onChange={setImportProject}
                    options={['None', 'Hospital ERP', 'CRM System', 'Mobile App', 'Website', 'DevOps']}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Import As</label>
                  <CustomSelect
                    value={importVisibility}
                    onChange={setImportVisibility}
                    options={['Public', 'Private']}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Personal Access Token (For Private Repos)</label>
                <input
                  type="password"
                  value={importToken}
                  onChange={(e) => setImportToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md  focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] text-sm"
                />
                <p className="text-[11px] text-gray-500 mt-1">Leave blank if the repository is public or if global GitHub App auth is enabled.</p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowImportModal(false)} className="px-4 py-2 border border-gray-300 rounded-md  text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
              <button
                onClick={handleImport}
                disabled={importing}
                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#4F46E5] hover:bg-indigo-600 transition-colors flex items-center gap-2 ${importing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {importing && <RefreshCw size={14} className="animate-spin" />}
                {importing ? 'Importing...' : 'Begin Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && selectedRepo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded shadow-xl w-full max-w-xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Settings size={18} className="text-[#4F46E5]" />
                {selectedRepo.name} Settings
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Repository Name</label>
                <input type="text" defaultValue={selectedRepo.name} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Default Branch</label>
                <CustomSelect
                  value="main"
                  onChange={() => { }}
                  options={['main', 'master', 'develop']}
                  className="w-full"
                />
              </div>
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-red-600 mb-2">Danger Zone</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Archive this repository</p>
                      <p className="text-xs text-gray-500">Mark this repository as archived and read-only.</p>
                    </div>
                    <button className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-md text-sm font-medium transition-colors">Archive</button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50/50">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Delete this repository</p>
                      <p className="text-xs text-gray-500">Permanently remove this repository from the dashboard.</p>
                    </div>
                    <button onClick={() => handleDeleteRepo(selectedRepo.id)} disabled={deleting} className="px-3 py-1.5 bg-red-600 border border-transparent text-white hover:bg-red-700 disabled:bg-red-400 rounded-md text-sm font-medium transition-colors">
                      {deleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowSettingsModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
              <button onClick={() => setShowSettingsModal(false)} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#4F46E5] hover:bg-indigo-600">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Webhook Modal */}
      {showWebhookModal && selectedRepo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded shadow-xl w-full max-w-xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                <Webhook size={18} className="text-[#4F46E5]" />
                Webhook Integration
              </div>
              <button onClick={() => setShowWebhookModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-gray-600">
                Webhooks allow external services to be notified when certain events happen within your repository.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Payload URL</label>
                <div className="flex gap-2">
                  <input type="text" readOnly value={`https://dashboard.codigix.com/api/webhooks/github/${selectedRepo.id || 1}`} className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm font-mono" />
                  <button className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Copy</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Secret Token</label>
                <input type="password" placeholder="Enter a secret token..." className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5] text-sm" />
                <p className="text-xs text-gray-500 mt-1">Used to validate incoming webhook payloads.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Events</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" defaultChecked className="rounded text-[#4F46E5] focus:ring-[#4F46E5]" /> Push events</label>
                  <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" defaultChecked className="rounded text-[#4F46E5] focus:ring-[#4F46E5]" /> Pull request events</label>
                  <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" className="rounded text-[#4F46E5] focus:ring-[#4F46E5]" /> Issues events</label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
              <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle size={12} /> Webhook is active</span>
              <div className="flex gap-3">
                <button onClick={() => setShowWebhookModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Close</button>
                <button onClick={() => setShowWebhookModal(false)} className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-[#4F46E5] hover:bg-indigo-600">Update Webhook</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contributors Modal */}
      {showContributorsModal && selectedRepo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded shadow-xl w-full max-w-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                Contributors
              </div>
              <button onClick={() => setShowContributorsModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-0 overflow-y-auto max-h-[60vh]">
              <div className="divide-y divide-gray-100">
                {selectedRepo.contributors && selectedRepo.contributors.length > 0 ? (
                  selectedRepo.contributors.map((user, idx) => (
                    <div key={idx} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs  ${user.color || 'bg-gray-100 text-gray-700'}`}>
                          {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.role || 'Contributor'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-900">
                          <GitCommit size={12} className="text-gray-400" />
                          {user.commits}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-sm text-gray-500">
                    No contributors available for this repository.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Connection Modal */}
      {showConnectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg  text-gray-900">Manage GitHub Connection</h3>
              <button onClick={() => setShowConnectionModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Organization / User</label>
                  <input
                    type="text"
                    value={githubOrg}
                    onChange={(e) => setGithubOrg(e.target.value)}
                    placeholder="e.g. codigix-infotech"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">This is the default organization for synced repositories.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personal Access Token</label>
                  <input
                    type="password"
                    placeholder="ghp_***************************"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:border-[#4F46E5] focus:ring-1 focus:ring-[#4F46E5]"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Required for private repositories and webhooks.</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-50 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setShowConnectionModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowConnectionModal(false)} className="px-4 py-2 bg-[#4F46E5] text-white rounded-md hover:bg-indigo-600 text-sm font-medium transition-colors">
                Save Connection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
