import React, { useState, useEffect } from 'react';
import {
  Users, Plus, UserPlus, Briefcase, Trash2, Search, Filter, Shield, MoreVertical,
  ChevronDown, Folder, UserCheck, UserX, Clock, Calendar, Download, Eye, Edit3, ChevronRight, Activity, TrendingUp
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { teamsAPI, usersAPI, projectAPI } from '../../services/api';
import { showSuccessToast, showErrorToast } from '../../utils/toast';

const ITTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAssignProjectModalOpen, setIsAssignProjectModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [activeTab, setActiveTab] = useState('Team Allocation');

  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    manager_id: '',
    manager_role: '',
    members: [] // Array of { user_id: '', role: '', userName: '', roleSearch: '' }
  });
  const [newMember, setNewMember] = useState({ user_id: '', role: '' });
  const [projectAssignment, setProjectAssignment] = useState({ project_id: '' });

  // Search states for modals
  const [managerSearch, setManagerSearch] = useState('');
  const [managerRoleSearch, setManagerRoleSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');
  const [memberRoleSearch, setMemberRoleSearch] = useState('');

  const [activeDropdown, setActiveDropdown] = useState(null); // 'manager', 'managerRole', 'member', 'memberRole'

  const commonRoles = [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
    'UI/UX Designer', 'Mobile Developer', 'QA Engineer',
    'DevOps Engineer', 'Data Scientist', 'Project Manager',
    'Product Manager', 'Team Lead', 'IT Manager', 'CTO'
  ];

  useEffect(() => {
    fetchData();
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [teamsData, usersData, projectsData, departmentsData] = await Promise.all([
        teamsAPI.getAll(),
        usersAPI.getAll(),
        projectAPI.getAll(),
        fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/departments`).then(res => res.json())
      ]);

      const itDept = departmentsData.find(d => d.name === 'IT Department');
      const itDeptId = itDept ? itDept.id : 4;

      const filteredTeams = teamsData.filter(t => t.department_id === itDeptId || !t.department_id);

      // Fetch members for each team
      const teamsWithMembers = await Promise.all(filteredTeams.map(async (team) => {
        try {
          const members = await teamsAPI.getMembers(team.id);
          return { ...team, members };
        } catch (err) {
          console.error(`Failed to fetch members for team ${team.id}`, err);
          return { ...team, members: [] };
        }
      }));

      setTeams(teamsWithMembers);
      setUsers(usersData);
      setProjects(projectsData.filter(p => p.category === 'IT' || p.projectType === 'IT'));
    } catch (error) {
      console.error('Failed to fetch teams data:', error);
      showErrorToast('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    try {
      const departmentsData = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/departments`).then(res => res.json());
      const itDept = departmentsData.find(d => d.name === 'IT Department');
      const itDeptId = itDept ? itDept.id : 4;

      const response = await teamsAPI.create({
        name: newTeam.name,
        description: newTeam.description,
        department_id: itDeptId,
        manager_id: newTeam.manager_id,
        manager_role: newTeam.manager_role
      });

      if (response.success && newTeam.members.length > 0) {
        // Add members to the newly created team
        for (const member of newTeam.members) {
          if (member.user_id && member.role) {
            await teamsAPI.addMember(response.id, {
              user_id: member.user_id,
              role: member.role
            });
          }
        }
      }

      showSuccessToast('Team created successfully');
      setIsCreateModalOpen(false);
      setNewTeam({
        name: '',
        description: '',
        manager_id: '',
        manager_role: '',
        members: []
      });
      setManagerSearch('');
      setManagerRoleSearch('');
      fetchData();
    } catch (error) {
      showErrorToast('Failed to create team');
    }
  };

  const addMemberField = () => {
    setNewTeam({
      ...newTeam,
      members: [...newTeam.members, { user_id: '', role: '', userName: '', roleSearch: '', searchActive: false, roleSearchActive: false }]
    });
  };

  const removeMemberField = (index) => {
    const updatedMembers = [...newTeam.members];
    updatedMembers.splice(index, 1);
    setNewTeam({ ...newTeam, members: updatedMembers });
  };

  const updateMemberField = (index, field, value) => {
    const updatedMembers = [...newTeam.members];
    updatedMembers[index][field] = value;
    setNewTeam({ ...newTeam, members: updatedMembers });
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await teamsAPI.addMember(selectedTeam.id, newMember);
      showSuccessToast('Member added to team');
      setIsAddMemberModalOpen(false);
      setNewMember({ user_id: '', role: '' });
      setMemberSearch('');
      setMemberRoleSearch('');
      fetchData();
    } catch (error) {
      showErrorToast('Failed to add member');
    }
  };

  const handleAssignProject = async (e) => {
    e.preventDefault();
    try {
      await projectAPI.update(projectAssignment.project_id, { team_id: selectedTeam.id });
      showSuccessToast('Team assigned to project');
      setIsAssignProjectModalOpen(false);
      setProjectAssignment({ project_id: '' });
      fetchData();
    } catch (error) {
      showErrorToast('Failed to assign project');
    }
  };

  const filteredManagers = users.filter(u =>
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(managerSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(managerSearch.toLowerCase())
  );

  const filteredMembers = users.filter(u =>
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(memberSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const filteredManagerRoles = commonRoles.filter(role =>
    role.toLowerCase().includes(managerRoleSearch.toLowerCase())
  );

  const filteredMemberRoles = commonRoles.filter(role =>
    role.toLowerCase().includes(memberRoleSearch.toLowerCase())
  );


  const totalUsers = users.length;
  const activeAssignments = teams.reduce((acc, t) => acc + (t.members ? t.members.length : 0), 0);

  // Dynamic Role Allocations
  const roleMap = {};
  users.forEach(u => {
    const r = u.job_title || (u.job_title || u.role || 'Member') || 'Member';
    roleMap[r] = (roleMap[r] || 0) + 1;
  });
  const dynamicRoleAllocations = Object.entries(roleMap).map(([role, count]) => ({
    role,
    count,
    pct: totalUsers ? ((count / totalUsers) * 100).toFixed(2) + '%' : '0%'
  }));

  // Dynamic Workload Data (Mock mapping for now based on team assignments)
  const dynamicWorkloadData = totalUsers > 0 ? [
    { name: 'Overallocated', value: 0, color: '#ef4444', pct: '0%' },
    { name: 'High (80-100%)', value: Math.floor(totalUsers * 0.1), color: '#f59e0b', pct: '10%' },
    { name: 'Medium (50-79%)', value: Math.floor(totalUsers * 0.5), color: '#3b82f6', pct: '50%' },
    { name: 'Low (1-49%)', value: totalUsers - Math.floor(totalUsers * 0.6), color: '#22c55e', pct: '40%' }
  ] : [];


  return (
    <>
      <div className="p-4 bg-[#F8FAFC] min-h-screen font-sans">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl  text-gray-900 mb-1">Team Management</h1>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <span className="hover:text-indigo-600 cursor-pointer transition-colors">Dashboard</span>
              <ChevronRight size={10} />
              <span className="text-gray-900 font-medium">Team Management</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 bg-white border border-gray-200 text-gray-700 rounded-md text-sm font-medium flex items-center gap-2  hover:bg-gray-50 transition-colors">
              <Users size={14} /> Team Workload
            </button>
            <button className="p-2 bg-white border border-gray-200 text-gray-700 rounded-md text-sm font-medium flex items-center gap-2  hover:bg-gray-50 transition-colors">
              <Download size={14} /> Import Team
            </button>
            <button onClick={() => setIsCreateModalOpen(true)} className="p-2 bg-indigo-600 text-white rounded-md text-sm font-medium flex items-center gap-2  hover:bg-indigo-700 transition-colors">
              <Plus size={14} /> Assign Team
            </button>
          </div>
        </div>

        {/* TOP KPI CARDS */}
        <div className="grid grid-cols-6 gap-2 mb-6">
          {[
            { title: 'Total Team Members', val: totalUsers, sub: 'Active Employees', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { title: 'Total Projects', val: projects.length, sub: 'Projects Assigned', icon: Folder, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { title: 'Active Assignments', val: activeAssignments, sub: 'Across All Projects', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
            { title: 'Overallocated', val: '6', sub: 'Members', icon: UserX, color: 'text-rose-500', bg: 'bg-rose-50' },
            { title: 'Available Capacity', val: '32.5%', sub: 'Team Availability', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
            { title: 'Utilization Rate', val: '67.5%', sub: 'Average Overall', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((k, i) => (
            <div key={i} className="bg-white p-2 rounded border border-gray-100  flex items-center gap-2">
              <div className={`p-3 rounded ${k.bg} ${k.color} shrink-0`}><k.icon size={20} /></div>
              <div>
                <div className="text-sm font-medium text-gray-500 mb-0.5">{k.title}</div>
                <div className="text-xl  text-gray-900 mb-0.5">{k.val}</div>
                <div className="text-[9px] text-gray-400">{k.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* TABS & FILTERS */}
        <div className="mb-6">
          <div className="flex items-center gap-8 border-b border-gray-200 mb-4 px-2">
            {['Team Allocation', 'Project Wise Team', 'Role Management', 'Skills Matrix', 'Availability Calendar', 'Leave & Attendance'].map((tab) => (
              <div
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-[12px] font-semibold cursor-pointer transition-colors relative ${activeTab === tab
                  ? 'text-indigo-600  border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {['All Projects', 'All Roles', 'All Skills', 'All Status'].map((f, i) => (
              <div key={i} className="flex items-center justify-between gap-6 p-2 bg-white border border-gray-200 rounded cursor-pointer  hover:bg-gray-50 transition-colors w-40">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{f}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </div>
            ))}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search team members..." className=" pl-9 pr-4 py-2 bg-white border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow  w-[200px]" />
            </div>
            <button className="p-2 bg-white border border-gray-200 text-gray-700 rounded text-sm font-medium flex items-center gap-2  hover:bg-gray-50 transition-colors">
              <Filter size={14} className="text-gray-500" /> More Filters
            </button>
            <button className="p-2 text-indigo-600 bg-indigo-50 rounded text-sm font-medium hover:bg-indigo-100 transition-colors">
              Reset
            </button>
          </div>
        </div>

        {/* TABS CONTENT CODES */}
        {activeTab === 'Team Allocation' && (
          <div className="space-y-6">
            <div className="grid grid-cols-12 gap-6">
              {/* TEAMS LIST - Left column (4 cols) */}
              <div className="col-span-4 bg-white rounded border border-gray-100  flex flex-col p-4">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                  <h2 className="text-[13px] font-semibold text-gray-900">Active Teams</h2>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                  >
                    <Plus size={12} /> New Team
                  </button>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                  {teams.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-xs">
                      No teams found. Click "New Team" to create one!
                    </div>
                  ) : (
                    teams.map(team => {
                      const manager = users.find(u => u.id === team.manager_id);
                      const isSelected = selectedTeam?.id === team.id;
                      return (
                        <div
                          key={team.id}
                          onClick={() => setSelectedTeam(team)}
                          className={`p-3.5 rounded border cursor-pointer transition-all hover:shadow-md ${isSelected
                            ? 'border-indigo-600 bg-indigo-50/30'
                            : 'border-gray-100 hover:border-gray-200 bg-white'
                            }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-semibold text-xs text-gray-900">{team.name}</div>
                            <span className="text-[9px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full ">
                              {team.members?.length || 0} members
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{team.description || 'No description provided.'}</p>

                          <div className="flex justify-between items-center border-t border-gray-50 pt-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[9px]  ">
                                {manager ? manager.first_name[0] : 'M'}
                              </div>
                              <div>
                                <div className="text-[9px] text-gray-400">Manager</div>
                                <div className="text-xs font-medium text-gray-800">
                                  {manager ? `${manager.first_name} ${manager.last_name}` : 'Unassigned'}
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => { setSelectedTeam(team); setIsAddMemberModalOpen(true); }}
                                className="p-1 hover:bg-indigo-50 text-indigo-600 rounded transition-colors"
                                title="Add Member"
                              >
                                <UserPlus size={13} />
                              </button>
                              <button
                                onClick={() => { setSelectedTeam(team); setIsAssignProjectModalOpen(true); }}
                                className="p-1 hover:bg-emerald-50 text-emerald-600 rounded transition-colors"
                                title="Assign Project"
                              >
                                <Folder size={13} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Are you sure you want to delete the team "${team.name}"?`)) {
                                    try {
                                      await fetch(`http://localhost:5000/api/teams/${team.id}`, { method: 'DELETE' });
                                      showSuccessToast('Team deleted successfully');
                                      fetchData();
                                    } catch (err) {
                                      showErrorToast('Failed to delete team');
                                    }
                                  }
                                }}
                                className="p-1 hover:bg-red-50 text-red-600 rounded transition-colors"
                                title="Delete Team"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* MEMBERS DETAILS - Right column (8 cols) */}
              <div className="col-span-8 bg-white rounded border border-gray-100  flex flex-col">
                <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl">
                  <div>
                    <h2 className="text-[13px] font-semibold text-gray-900">
                      {selectedTeam ? `${selectedTeam.name} Members` : 'All Members'}
                      <span className="text-gray-500 font-normal ml-1">
                        ({selectedTeam ? selectedTeam.members?.length || 0 : users.length})
                      </span>
                    </h2>
                    {selectedTeam && (
                      <p className="text-xs text-gray-400 mt-0.5">{selectedTeam.description}</p>
                    )}
                  </div>
                  {selectedTeam && (
                    <button onClick={() => setIsAddMemberModalOpen(true)} className="p-2 bg-indigo-600 text-white rounded text-xs font-medium flex items-center gap-1.5  hover:bg-indigo-700 transition-colors">
                      <Plus size={12} /> Add Member
                    </button>
                  )}
                </div>
                <div className="overflow-x-auto flex-1 max-h-[460px] custom-scrollbar">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500  bg-gray-50/50 sticky top-0 z-10">
                        <th className="py-3 px-4">Name</th>
                        <th className="p-2">Role</th>
                        <th className="p-2">Email</th>
                        <th className="p-2 text-center">Status</th>
                        {selectedTeam && <th className="py-3 px-4 text-center">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {selectedTeam ? (
                        selectedTeam.members && selectedTeam.members.length > 0 ? (
                          selectedTeam.members.map((member, i) => {
                            const user = users.find(u => u.id === member.user_id);
                            return (
                              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center  text-xs ">
                                      {user ? user.first_name[0] : 'U'}
                                    </div>
                                    <div>
                                      <div className="font-semibold text-gray-900">
                                        {user ? `${user.first_name} ${user.last_name}` : `User ID: ${member.user_id}`}
                                      </div>
                                      <div className="text-[9px] text-gray-400">{user?.email || 'No email'}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-2 text-gray-600 font-medium">{member.role}</td>
                                <td className="p-2 text-gray-500">{user?.email || 'N/A'}</td>
                                <td className="p-2 text-center">
                                  <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full  text-[9px]">Active</span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <button
                                    onClick={async () => {
                                      if (window.confirm(`Remove member from ${selectedTeam.name}?`)) {
                                        try {
                                          await fetch(`http://localhost:5000/api/teams/${selectedTeam.id}/members/${member.user_id}`, { method: 'DELETE' });
                                          showSuccessToast('Member removed');
                                          fetchData();
                                        } catch (err) {
                                          showErrorToast('Failed to remove member');
                                        }
                                      }
                                    }}
                                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                                    title="Remove Member"
                                  >
                                    <UserX size={13} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-gray-400 text-xs">
                              No members in this team yet. Click "Add Member" to invite someone!
                            </td>
                          </tr>
                        )
                      ) : (
                        users.map((u, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.first_name || 'U')}&background=random`} alt={(`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'User')} className="w-6 h-6 rounded-full object-cover" />
                                <div>
                                  <div className="font-semibold text-gray-900">{(`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'User')}</div>
                                  <div className="text-[9px] text-gray-400">{(u.job_title || u.role || 'Member')}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-2 text-gray-600 font-medium">{(u.job_title || u.role || 'Member')}</td>
                            <td className="p-2 text-gray-500">{(`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'User').toLowerCase().replace(' ', '')}@company.com</td>
                            <td className="p-2 text-center">
                              <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full  text-[9px]">Active</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Workload graph details */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white p-2 rounded border border-gray-100  flex flex-col col-span-2">
                <h3 className="text-[13px] font-semibold text-gray-900 mb-6">Team Workload Overview</h3>
                <div className="flex items-center justify-center gap-6 flex-1">
                  <div className="w-24 h-24 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={dynamicWorkloadData} cx="50%" cy="50%" innerRadius={30} outerRadius={45} paddingAngle={2} dataKey="value" stroke="none">
                          {dynamicWorkloadData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 flex-1">
                    {dynamicWorkloadData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                          <span className="text-gray-600">{d.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-semibold text-gray-900">{d.value}</span>
                          <span className="text-gray-400 w-8 text-right">({d.pct})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-2 rounded border border-gray-100  flex flex-col col-span-2">
                <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Core Focus Area Allocation</h3>
                <p className="text-sm text-gray-500 mb-4">Distribution of engineering resources across system layers</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Frontend Development</span>
                    <span className=" text-gray-800">40%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full" style={{ width: '40%' }}></div>
                  </div>

                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-600">Backend API Services</span>
                    <span className=" text-gray-800">35%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: '35%' }}></div>
                  </div>

                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-600">Infrastructure & DevOps</span>
                    <span className=" text-gray-800">25%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Project Wise Team' && (
          <div className="bg-white rounded border border-gray-100  flex flex-col mb-6">
            <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-xl">
              <div>
                <h2 className="text-[13px] font-semibold text-gray-900">Project Wise Team Allocation</h2>
                <p className="text-xs text-gray-400 mt-0.5">Tracking team assignment across all active projects</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500  bg-gray-50/50">
                    <th className="py-3 px-4">Project</th>
                    <th className="p-2">Assigned Team</th>
                    <th className="p-2">Team Size</th>
                    <th className="p-2">Project Manager</th>
                    <th className="p-2 text-center">Start Date</th>
                    <th className="p-2 text-center">End Date</th>
                    <th className="py-3 px-4 w-24">Progress</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {projects.map((p, i) => {
                    const assignedTeam = teams.find(t => t.id === p.team_id);
                    return (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900">{p.name}</div>
                          <span className="text-[9px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded mt-1 inline-block">IT Project</span>
                        </td>
                        <td className="p-2 font-medium text-indigo-600">
                          {assignedTeam ? assignedTeam.name : (
                            <span className="text-gray-400 font-normal">Unassigned</span>
                          )}
                        </td>
                        <td className="p-2 font-semibold text-gray-700">
                          {assignedTeam ? `${assignedTeam.members?.length || 0} Members` : '-'}
                        </td>
                        <td className="p-2 text-gray-700">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center  text-[9px]">P</div>
                            <span>PM Admin</span>
                          </div>
                        </td>
                        <td className="p-2 text-center text-gray-600 font-medium">{p.start_date ? new Date(p.start_date).toLocaleDateString() : (p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'Unknown')}</td>
                        <td className="p-2 text-center text-gray-600 font-medium">{p.end_date ? new Date(p.end_date).toLocaleDateString() : 'Ongoing'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-700 w-6">65%</span>
                            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600" style={{ width: `65%` }}></div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {projects.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500 text-xs">
                        No IT projects found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Role Management' && (
          <div className="grid grid-cols-12 gap-6 mb-6">
            <div className="col-span-4 bg-white p-2 rounded border border-gray-100  flex flex-col">
              <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Allocation by Role</h3>
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {dynamicRoleAllocations.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="text-gray-700 font-medium w-24">{r.role}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: r.pct }}></div>
                    </div>
                    <div className="w-16 flex justify-between text-gray-500">
                      <span className="font-semibold text-gray-900">{r.count}</span>
                      <span>({r.pct})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-8 bg-white rounded border border-gray-100  flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 bg-white rounded-t-xl">
                <h2 className="text-[13px] font-semibold text-gray-900">Role Breakdown Registry</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500  bg-gray-50/50">
                      <th className="py-3 px-4">Role Title</th>
                      <th className="p-2">Department</th>
                      <th className="p-2 text-center">Total Staff</th>
                      <th className="p-2 text-center">Utilization</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {commonRoles.map((role, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">{role}</td>
                        <td className="p-2 text-gray-600">IT Department</td>
                        <td className="p-2 text-center  text-indigo-600">
                          {Math.floor(Math.random() * 5) + 1} Staff
                        </td>
                        <td className="p-2 text-center text-green-600 ">100% Active</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Skills Matrix' && (
          <div className="grid grid-cols-12 gap-6 mb-6">
            <div className="col-span-4 bg-white p-2 rounded border border-gray-100  flex flex-col">
              <h3 className="text-[13px] font-semibold text-gray-900 mb-4">Top Skills in Team</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'React', count: 12, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                  { name: 'Node.js', count: 10, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                  { name: 'JavaScript', count: 12, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                  { name: 'TypeScript', count: 8, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                  { name: 'UI/UX', count: 8, color: 'text-rose-600 bg-rose-50 border-rose-100' },
                  { name: 'Figma', count: 7, color: 'text-purple-600 bg-purple-50 border-purple-100' },
                ].map((s, i) => (
                  <div key={i} className={`flex items-center gap-1.5 px-2 py-1 border rounded-md ${s.color}`}>
                    <span className="text-xs ">{s.name}</span>
                    <span className="text-[9px] opacity-80">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-8 bg-white rounded border border-gray-100  flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 bg-white rounded-t-xl">
                <h2 className="text-[13px] font-semibold text-gray-900">Skills Matrix Matrix</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500  bg-gray-50/50">
                      <th className="py-3 px-4">Resource</th>
                      <th className="p-2">Primary Skillset</th>
                      <th className="p-2 text-center">Expertise Level</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {users.map((u, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">{(`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'User')}</td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            {([u.job_title || 'Skill']).map(s => (
                              <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-semibold">{s}</span>
                            ))}
                          </div>
                        </td>
                        <td className="p-2 text-center">
                          <span className="px-2.5 py-1 bg-green-50 text-green-700  rounded text-[9px] ">Senior Expert</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Availability Calendar' && (
          <div className="bg-white rounded border border-gray-100  flex flex-col mb-6">
            <div className="px-5 py-4 border-b border-gray-100 bg-white rounded-t-xl">
              <h2 className="text-[13px] font-semibold text-gray-900">Resource Capacity & Calendar</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500  bg-gray-50/50">
                    <th className="py-3 px-4">Member Name</th>
                    <th className="p-2">Weekly Allocated Hours</th>
                    <th className="p-2 text-center">Available Capacity</th>
                    <th className="p-2 text-center">Utilization</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {users.map((u, i) => (
                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900">{(`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'User')}</td>
                      <td className="p-2 font-medium text-gray-700">40 Hours / week</td>
                      <td className="p-2 text-center text-emerald-600 ">{('100%')}</td>
                      <td className="p-2 text-center">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full  text-[9px]">80% Utilized</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Leave & Attendance' && (
          <div className="grid grid-cols-12 gap-6 mb-6">
            <div className="col-span-5 bg-white p-2 rounded border border-gray-100  flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[13px] font-semibold text-gray-900">Upcoming leaves schedule</h3>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Rahul Patil', role: 'Project Manager', date: '21 Jul 2026 - 23 Jul 2026', days: '3 Days', color: 'text-green-600 bg-green-50', avatar: 'https://i.pravatar.cc/150?u=1' },
                  { name: 'Sneha Joshi', role: 'UI/UX Designer', date: '25 Jul 2026 - 27 Jul 2026', days: '3 Days', color: 'text-green-600 bg-green-50', avatar: 'https://i.pravatar.cc/150?u=2' },
                  { name: 'Akshay More', role: 'Full Stack Developer', date: '28 Jul 2026 - 01 Aug 2026', days: '5 Days', color: 'text-orange-600 bg-orange-50', avatar: 'https://i.pravatar.cc/150?u=3' },
                ].map((l, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <img src={l.avatar} alt="" className="w-6 h-6 rounded-full" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{l.name}</div>
                        <div className="text-[9px] text-gray-500">{l.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] text-gray-500 font-medium">{l.date}</div>
                      <div className={`text-[9px] inline-block px-1.5 py-0.5 rounded mt-0.5 ${l.color}`}>{l.days}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-7 bg-white rounded border border-gray-100  flex flex-col">
              <div className="px-5 py-4 border-b border-gray-100 bg-white rounded-t-xl">
                <h2 className="text-[13px] font-semibold text-gray-900">Attendance Log</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500  bg-gray-50/50">
                      <th className="py-3 px-4">Member</th>
                      <th className="p-2 text-center">Clock-in Time</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {users.map((u, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-semibold text-gray-900">{(`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'User')}</td>
                        <td className="p-2 text-center text-gray-600">09:00 AM</td>
                        <td className="p-2 text-center">
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full  text-[9px]">Present</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-3 w-full max-w-md shadow-xl">
            <h2 className="text-xl  mb-2">Create New Team</h2>
            <form onSubmit={handleCreateTeam} className="space-y-4">


              <div>
                <label className="block text-xs  text-gray-700 mb-1">Team Manager</label>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    placeholder="Search for manager..."
                    className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-red-500 outline-none text-xs"
                    value={managerSearch}
                    onChange={(e) => {
                      setManagerSearch(e.target.value);
                      setActiveDropdown('manager');
                    }}
                    onFocus={() => setActiveDropdown('manager')}
                    required={!newTeam.manager_id}
                  />
                  {activeDropdown === 'manager' && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
                      {filteredManagers.length > 0 ? (
                        filteredManagers.map(u => (
                          <div
                            key={u.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer flex flex-col"
                            onClick={() => {
                              setNewTeam({ ...newTeam, manager_id: u.id });
                              setManagerSearch(`${u.first_name} ${u.last_name}`);
                              setActiveDropdown(null);
                            }}
                          >
                            <span className=" text-xs">{u.first_name} {u.last_name}</span>
                            <span className="text-xs text-gray-500">{u.email}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500 text-sm">No users found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>


              {/* Members Selection in Create Team */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm text-gray-700">Team Members</label>
                  <button
                    type="button"
                    onClick={addMemberField}
                    className="text-red-600 hover:text-red-700 text-xs  flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Member
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {newTeam.members.map((member, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded border border-gray-200 relative group">
                      <button
                        type="button"
                        onClick={() => removeMemberField(index)}
                        className="absolute -top-2 -right-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 rounded-full p-1  opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>

                      <div className="grid grid-cols-1 gap-3">
                        {/* Member Name Search */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            placeholder="Search member name..."
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:ring-2 focus:ring-red-500 outline-none bg-white"
                            value={member.userName}
                            onChange={(e) => {
                              updateMemberField(index, 'userName', e.target.value);
                              updateMemberField(index, 'searchActive', true);
                            }}
                            onFocus={() => updateMemberField(index, 'searchActive', true)}
                          />
                          {member.searchActive && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-auto">
                              {users.filter(u =>
                                `${u.first_name} ${u.last_name}`.toLowerCase().includes(member.userName.toLowerCase())
                              ).map(u => (
                                <div
                                  key={u.id}
                                  className="px-2 py-1.5 hover:bg-gray-100 cursor-pointer flex flex-col"
                                  onClick={() => {
                                    updateMemberField(index, 'user_id', u.id);
                                    updateMemberField(index, 'userName', `${u.first_name} ${u.last_name}`);
                                    updateMemberField(index, 'searchActive', false);
                                  }}
                                >
                                  <span className=" text-xs">{u.first_name} {u.last_name}</span>
                                  <span className="text-xs text-gray-500">{u.email}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Member Role Search */}
                        <div className="relative" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            placeholder="Role (e.g., Frontend Developer)"
                            className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white"
                            value={member.roleSearch}
                            onChange={(e) => {
                              updateMemberField(index, 'roleSearch', e.target.value);
                              updateMemberField(index, 'role', e.target.value);
                              updateMemberField(index, 'roleSearchActive', true);
                            }}
                            onFocus={() => updateMemberField(index, 'roleSearchActive', true)}
                          />
                          {member.roleSearchActive && (
                            <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-40 overflow-auto">
                              {commonRoles.filter(r =>
                                r.toLowerCase().includes(member.roleSearch.toLowerCase())
                              ).map(role => (
                                <div
                                  key={role}
                                  className="px-2 py-1.5 hover:bg-gray-100 cursor-pointer text-xs"
                                  onClick={() => {
                                    updateMemberField(index, 'role', role);
                                    updateMemberField(index, 'roleSearch', role);
                                    updateMemberField(index, 'roleSearchActive', false);
                                  }}
                                >
                                  {role}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {newTeam.members.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">No members added yet. Click "Add Member" to begin.</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 p-2 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white p-2 rounded hover:bg-red-700 text-xs"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddMemberModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-2 w-full max-w-md shadow-xl">
            <h2 className="text-xl  mb-2">Add Member to {selectedTeam?.name}</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs  text-gray-700 mb-1">Select User</label>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    placeholder="Search for user..."
                    className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-red-500 outline-none text-xs"
                    value={memberSearch}
                    onChange={(e) => {
                      setMemberSearch(e.target.value);
                      setActiveDropdown('member');
                    }}
                    onFocus={() => setActiveDropdown('member')}
                    required={!newMember.user_id}
                  />
                  {activeDropdown === 'member' && (
                    <div className="absolute z-10 w-full mt-1 bg-white border text-xs border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
                      {filteredMembers.length > 0 ? (
                        filteredMembers.map(u => (
                          <div
                            key={u.id}
                            className="p-2 hover:bg-gray-100 cursor-pointer flex flex-col"
                            onClick={() => {
                              setNewMember({ ...newMember, user_id: u.id });
                              setMemberSearch(`${u.first_name} ${u.last_name}`);
                              setActiveDropdown(null);
                            }}
                          >
                            <span className=" text-sm">{u.first_name} {u.last_name}</span>
                            <span className="text-xs text-gray-500">{u.email}</span>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500 text-sm">No users found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs  text-gray-700 mb-1">Role in Team</label>
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    placeholder="Search or type role..."
                    className="w-full border border-gray-300 rounded p-2 text-xs focus:ring-2 focus:ring-red-500 outline-none"
                    value={memberRoleSearch}
                    onChange={(e) => {
                      setMemberRoleSearch(e.target.value);
                      setNewMember({ ...newMember, role: e.target.value });
                      setActiveDropdown('memberRole');
                    }}
                    onFocus={() => setActiveDropdown('memberRole')}
                    required
                  />
                  {activeDropdown === 'memberRole' && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
                      {filteredMemberRoles.length > 0 ? (
                        filteredMemberRoles.map(role => (
                          <div
                            key={role}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => {
                              setNewMember({ ...newMember, role: role });
                              setMemberRoleSearch(role);
                              setActiveDropdown(null);
                            }}
                          >
                            {role}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-gray-500 text-sm">Type to create custom role</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddMemberModalOpen(false)}
                  className="flex-1 p-2 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white p-2 rounded hover:bg-red-700 text-xs"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Project Modal */}
      {isAssignProjectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded p-3 w-full max-w-md shadow-xl">
            <h2 className="text-xl  mb-4">Assign Project to {selectedTeam?.name}</h2>
            <form onSubmit={handleAssignProject} className="space-y-4">
              <div>
                <label className="block text-sm  text-gray-700 mb-1">Select IT Project</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-red-500 outline-none"
                  value={projectAssignment.project_id}
                  onChange={e => setProjectAssignment({ project_id: e.target.value })}
                >
                  <option value="">Select Project</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAssignProjectModalOpen(false)}
                  className="flex-1 p-2 text-xs border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white p-2 rounded hover:bg-red-700 text-xs"
                >
                  Assign Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ITTeamsPage;
