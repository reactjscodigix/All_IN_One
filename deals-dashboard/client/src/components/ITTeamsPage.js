import React, { useState, useEffect } from 'react';
import { Users, Plus, UserPlus, Briefcase, Trash2, Search, Filter, Shield, MoreVertical } from 'lucide-react';
import { teamsAPI, usersAPI, projectAPI } from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const ITTeamsPage = () => {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAssignProjectModalOpen, setIsAssignProjectModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  
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

  return (
    <div className="p-3 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl text-gray-900">IT Team Management</h1>
          <p className="text-gray-600 text-xs">Create and manage IT development teams</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-red-600 text-white p-2 rounded hover:bg-red-700 text-xs transition-colors"
        >
          <Plus size={15} />
          Create Team
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teams.map(team => (
            <div key={team.id} className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield size={16} className="text-red-500" />
                  <p>Manager: {team.manager_name || 'Unassigned'}</p>
                </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={15} />
                  </button>
                </div>
                
              </div>
              
              <div className="p-2">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm text-gray-700  ">Team Members</h4>
                  <button 
                    onClick={() => {
                      setSelectedTeam(team);
                      setIsAddMemberModalOpen(true);
                    }}
                    className="text-red-600 hover:text-red-700 text-xs  flex items-center gap-1"
                  >
                    <UserPlus size={14} />
                    Add
                  </button>
                </div>
                
                <div className="space-y-2 mb-2 max-h-40 overflow-y-auto pr-1">
                  {team.members && team.members.length > 0 ? (
                    team.members.map(member => (
                      <div key={member.id} className="flex items-center justify-between group/member">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-[10px] font-bold border border-white shadow-sm overflow-hidden">
                            {member.avatar ? (
                              <img src={member.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span>{member.first_name?.[0]}{member.last_name?.[0]}</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm  text-gray-800 leading-none">{member.first_name} {member.last_name}</p>
                            <p className="text-[10px] text-gray-500 mt-1">{member.role}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                      <Users size={16} />
                      <span>No members added yet</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setSelectedTeam(team);
                      setIsAssignProjectModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 p-2 rounded hover:bg-gray-50 transition-colors text-xs"
                  >
                    <Briefcase size={16} />
                    Assign to Project
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex flex-col"
                            onClick={() => {
                              setNewTeam({...newTeam, manager_id: u.id});
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
                        className="absolute -top-2 -right-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
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
                                  <span className="text-[10px] text-gray-500">{u.email}</span>
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
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex flex-col"
                            onClick={() => {
                              setNewMember({...newMember, user_id: u.id});
                              setMemberSearch(`${u.first_name} ${u.last_name}`);
                              setActiveDropdown(null);
                            }}
                          >
                            <span className=" text-sm">{u.first_name} {u.last_name}</span>
                            <span className="text-xs text-gray-500">{u.email}</span>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">No users found</div>
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
                      setNewMember({...newMember, role: e.target.value});
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
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => {
                              setNewMember({...newMember, role: role});
                              setMemberRoleSearch(role);
                              setActiveDropdown(null);
                            }}
                          >
                            {role}
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">Type to create custom role</div>
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
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                  value={projectAssignment.project_id}
                  onChange={e => setProjectAssignment({project_id: e.target.value})}
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
    </div>
  );
};

export default ITTeamsPage;
