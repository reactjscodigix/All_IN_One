import React, { useState } from 'react';
import { Plus, ChevronDown, MoreVertical, Calendar, User, CornerDownLeft, CheckSquare, Edit2, Check, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const KanbanPage = () => {
  const { user } = useAuth();
  
  const getInitialStatuses = () => {
    if (user?.department === 'IT Department') {
      return ['Backlog', 'Development', 'Testing', 'Deployment', 'Completed'];
    }
    if (user?.department === 'Marketing Department') {
      return ['Planning', 'In Progress', 'Content Creation', 'Approval', 'Published'];
    }
    return ['TO DO', 'in-progress', 'pending requirements', 'QA testing', 'Done', 'On Hold'];
  };

  const [statusList, setStatusList] = useState(getInitialStatuses());

  const [projects, setProjects] = useState(() => {
    const statuses = getInitialStatuses();
    const initialProjects = {};
    statuses.forEach(status => {
      initialProjects[status] = [];
    });
    
    // Add some sample data based on department
    if (user?.department === 'IT Department') {
      initialProjects['Backlog'] = [
        { id: 1, ticketNo: 'IT-101', name: 'API Integration', priority: 'High', budget: '$12,000', tasks: '2/5', dueDate: '20 Mar', assignees: 2 }
      ];
      initialProjects['Development'] = [
        { id: 2, ticketNo: 'IT-102', name: 'Frontend Refactor', priority: 'Medium', budget: '$8,000', tasks: '5/10', dueDate: '15 Mar', assignees: 3 }
      ];
    }
    
    return initialProjects;
  });

  const [draggedProject, setDraggedProject] = useState(null);
  const [activeAddStatus, setActiveAddStatus] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState(null);
  const [isAssigneeDropdownOpen, setIsAssigneeDropdownOpen] = useState(false);
  const [activeCardMenu, setActiveCardMenu] = useState(null);
  const [activeCardStatusDropdown, setActiveCardStatusDropdown] = useState(null);
  const [activeCardAssigneeDropdown, setActiveCardAssigneeDropdown] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [tempTaskName, setTempTaskName] = useState('');

  const users = [
    { id: 'unassigned', name: 'Unassigned', email: '', avatar: null },
    { id: 'automatic', name: 'Automatic', email: '', avatar: null },
    { id: 'user1', name: 'ashwini1006', email: 'ashwinikhedekar1006@gmail.com', avatar: 'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-10.jpg' }
  ];

  const handleAddStatus = () => {
    const newStatus = window.prompt('Enter new status name:');
    if (newStatus && !statusList.includes(newStatus)) {
      setStatusList([...statusList, newStatus]);
      setProjects(prev => ({ ...prev, [newStatus]: [] }));
    }
  };

  const handleAddNewTask = (status) => {
    if (!newTaskName.trim()) {
      setActiveAddStatus(null);
      return;
    }

    const totalTasks = Object.values(projects).flat().length;
    const newTask = {
      id: Date.now(),
      ticketNo: `KAN-${totalTasks + 1}`,
      name: newTaskName,
      priority: 'Medium',
      budget: '$0',
      tasks: '0/0',
      dueDate: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      assignees: selectedAssignee ? 1 : 0,
      assigneeDetails: selectedAssignee
    };

    setProjects(prev => ({
      ...prev,
      [status]: [...(prev[status] || []), newTask]
    }));

    setNewTaskName('');
    setSelectedAssignee(null);
    setIsAssigneeDropdownOpen(false);
    setActiveAddStatus(null);
  };

  const handleDragStart = (project, sourceStatus) => {
    setDraggedProject({ ...project, sourceStatus });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetStatus) => {
    if (!draggedProject || draggedProject.sourceStatus === targetStatus) return;

    setProjects(prev => {
      const newProjects = { ...prev };
      // Remove from source
      newProjects[draggedProject.sourceStatus] = newProjects[draggedProject.sourceStatus].filter(
        p => p.id !== draggedProject.id
      );
      // Add to target
      newProjects[targetStatus] = [...(newProjects[targetStatus] || []), { ...draggedProject, sourceStatus: undefined }];
      return newProjects;
    });

    setDraggedProject(null);
  };

  const handleDeleteTask = (status, taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setProjects(prev => ({
        ...prev,
        [status]: prev[status].filter(t => t.id !== taskId)
      }));
    }
    setActiveCardMenu(null);
  };

  const handleEditTask = (task) => {
    const newName = window.prompt('Edit task name:', task.name);
    if (newName) {
      setProjects(prev => {
        const newProjects = { ...prev };
        Object.keys(newProjects).forEach(status => {
          newProjects[status] = newProjects[status].map(t => 
            t.id === task.id ? { ...t, name: newName } : t
          );
        });
        return newProjects;
      });
    }
    setActiveCardMenu(null);
  };

  const handleStatusUpdate = (currentStatus, targetStatus, task) => {
    if (currentStatus === targetStatus) return;
    setProjects(prev => {
      const newProjects = { ...prev };
      newProjects[currentStatus] = newProjects[currentStatus].filter(t => t.id !== task.id);
      newProjects[targetStatus] = [...(newProjects[targetStatus] || []), task];
      return newProjects;
    });
    setActiveCardStatusDropdown(null);
  };

  const handleAssigneeUpdate = (task, user) => {
    setProjects(prev => {
      const newProjects = { ...prev };
      Object.keys(newProjects).forEach(status => {
        newProjects[status] = newProjects[status].map(t => 
          t.id === task.id ? { 
            ...t, 
            assigneeDetails: user.id === 'unassigned' ? null : user,
            assignees: user.id === 'unassigned' ? 0 : 1 
          } : t
        );
      });
      return newProjects;
    });
    setActiveCardAssigneeDropdown(null);
  };

  const handleInlineSave = (taskId) => {
    if (tempTaskName.trim()) {
      setProjects(prev => {
        const newProjects = { ...prev };
        Object.keys(newProjects).forEach(status => {
          newProjects[status] = newProjects[status].map(t => 
            t.id === taskId ? { ...t, name: tempTaskName } : t
          );
        });
        return newProjects;
      });
    }
    setEditingTaskId(null);
    setTempTaskName('');
  };

  const handleInlineCancel = () => {
    setEditingTaskId(null);
    setTempTaskName('');
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-700 border border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border border-yellow-300';
      case 'Low': return 'bg-green-100 text-green-700 border border-green-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getColumnCount = (status) => {
    return projects[status]?.length || 0;
  };

  const avatars = [
    'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-10.jpg',
    'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-08.jpg',
    'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-07.jpg',
    'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-02.jpg',
    'https://preadmin.dreamstechnologies.com/html/crm/assets/img/profiles/avatar-03.jpg'
  ];

  return (
    <div className="p-3 sm:p-3 lg:p-3 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl  text-gray-900">Kanban View</h1>
            <div className="flex items-center gap-2 text-xs  text-gray-600 mt-2">
              <button className="text-gray-600 hover:text-gray-900">Home</button>
              <span>›</span>
              <button className="text-gray-600 hover:text-gray-900">Applications</button>
              <span>›</span>
              <span>Kanban</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded p-3  mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {avatars.slice(0, 3).map((avatar, idx) => (
                  <img key={idx} src={avatar} alt="user" className="w-8 h-8 rounded-full border-2 border-white" />
                ))}
                <span className="text-xs  text-gray-700  ">1+</span>
              </div>

              <div className="text-xs ">
                <span className="text-gray-600">Total Task: </span>
                <span className=" text-gray-900">55</span>
                <span className="text-gray-600 ml-4">Pending: </span>
                <span className=" text-gray-900">15</span>
                <span className="text-gray-600 ml-4">Completed: </span>
                <span className=" text-gray-900">40</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <select className="p-2  border border-gray-300 rounded  text-xs    text-gray-700 bg-white appearance-none cursor-pointer hover:border-gray-400">
                  <option>Select Priority</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1F2020] pointer-events-none" />
              </div>

              <div className="relative">
                <select className="p-2  border border-gray-300 rounded  text-xs    text-gray-700 bg-white appearance-none cursor-pointer hover:border-gray-400">
                  <option>Clients</option>
                  <option>Sophie</option>
                  <option>Cameron</option>
                  <option>Doris</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1F2020] pointer-events-none" />
              </div>

              <div className="relative">
                <select className="p-2  border border-gray-300 rounded  text-xs    text-gray-700 bg-white appearance-none cursor-pointer hover:border-gray-400">
                  <option>Select Status</option>
                  <option>Inprogress</option>
                  <option>On-hold</option>
                  <option>Completed</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1F2020] pointer-events-none" />
              </div>

              <div className="relative">
                <select className="p-2  border border-gray-300 rounded  text-xs    text-gray-700 bg-white appearance-none cursor-pointer hover:border-gray-400">
                  <option>Sort By: Recent</option>
                  <option>Recently Added</option>
                  <option>Ascending</option>
                  <option>Descending</option>
                  <option>Last Month</option>
                  <option>Last 7 Days</option>
                </select>
                <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#1F2020] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4">
          {statusList.map((status) => (
            <div 
              key={status} 
              className="bg-white rounded  border border-gray-200 flex flex-col min-w-[250px] max-w-[200px]"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(status)}
            >
              <div className="bg-gray-50 p-2 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-xs   text-gray-900">{status}</h3>
                  <p className="text-xs text-gray-600">{String(getColumnCount(status)).padStart(2, '0')}</p>
                </div>
                <button className="text-[#1F2020] hover:text-gray-600">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="flex-1 p-2 space-y-3">
                {projects[status]?.map((project) => (
                  <div 
                    key={project.id} 
                    className="bg-white border border-gray-200 rounded  p-2 hover:shadow-sm transition-shadow cursor-move relative group"
                    draggable
                    onDragStart={() => handleDragStart(project, status)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs    text-[#1F2020]">{project.ticketNo}</span>
                      </div>
                      <div className="relative">
                        <button 
                          onClick={() => setActiveCardMenu(activeCardMenu === project.id ? null : project.id)}
                          className="text-[#1F2020] hover:text-gray-600"
                        >
                          <MoreVertical size={14} />
                        </button>
                        
                        {activeCardMenu === project.id && (
                          <div className="absolute top-full right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg z-50 py-1">
                            <button 
                              onClick={() => {
                                setEditingTaskId(project.id);
                                setTempTaskName(project.name);
                                setActiveCardMenu(null);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                            >
                              Edit Task
                            </button>
                            <button 
                              onClick={() => handleDeleteTask(status, project.id)}
                              className="w-full text-left px-3 py-1.5 text-xs text-red  hover:bg-red-50"
                            >
                              Delete Task
                            </button>
                            <button className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">
                              View Ticket
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="relative mb-2">
                      <button 
                        onClick={() => setActiveCardStatusDropdown(activeCardStatusDropdown === project.id ? null : project.id)}
                        className="flex items-center gap-1 p-1  rounded text-xs  bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        {status.toUpperCase()}
                        <ChevronDown size={10} />
                      </button>
                      
                      {activeCardStatusDropdown === project.id && (
                        <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-gray-200 rounded shadow-lg z-50 py-1">
                          {statusList.map(s => (
                            <button
                              key={s}
                              onClick={() => handleStatusUpdate(status, s, project)}
                              className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {editingTaskId === project.id ? (
                      <div className="space-y-2 mb-2">
                        <div className="border border-blue-500 rounded p-1">
                          <input
                            autoFocus
                            className="w-full text-xs  outline-none px-1"
                            value={tempTaskName}
                            onChange={(e) => setTempTaskName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleInlineSave(project.id);
                              if (e.key === 'Escape') handleInlineCancel();
                            }}
                          />
                        </div>
                        <div className="flex justify-end gap-1">
                          <button 
                            onClick={() => handleInlineSave(project.id)}
                            className="p-1 border border-gray-200 rounded hover:bg-gray-50"
                          >
                            <Check size={14} className="text-gray-600" />
                          </button>
                          <button 
                            onClick={handleInlineCancel}
                            className="p-1 border border-gray-200 rounded hover:bg-gray-50"
                          >
                            <X size={14} className="text-gray-600" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-2 p-1 rounded transition-colors group/edit">
                        <h4 className="text-xs  text-gray-900 flex-1">{project.name}</h4>
                        <button 
                          onClick={() => {
                            setEditingTaskId(project.id);
                            setTempTaskName(project.name);
                          }}
                          className="opacity-0 group-hover:opacity-100 group-hover/edit:text-blue-500 text-[#1F2020] transition-all"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    )}

                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                      <div className="flex items-center justify-between">
                        <span>Estimate Date</span>
                        <span className="  text-gray-900">{project.dueDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="relative">
                        <div 
                          className="flex items-center gap-1 cursor-pointer"
                          onClick={() => setActiveCardAssigneeDropdown(activeCardAssigneeDropdown === project.id ? null : project.id)}
                        >
                          {project.assigneeDetails ? (
                            <img src={project.assigneeDetails.avatar || avatars[0]} alt="assignee" className="w-6 h-6 rounded-full border-2 border-white" />
                          ) : (
                            <div className="flex -space-x-2">
                              {avatars.slice(0, 3).map((avatar, idx) => (
                                <img key={idx} src={avatar} alt="assignee" className="w-6 h-6 rounded-full border-2 border-white bg-white" />
                              ))}
                            </div>
                          )}
                          {!project.assigneeDetails && (
                            <span className="text-xs  text-gray-500 ml-1">1+</span>
                          )}
                        </div>

                        {activeCardAssigneeDropdown === project.id && (
                          <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded shadow-lg z-50">
                            <div className="p-2 border-b">
                              <input 
                                type="text" 
                                placeholder="Search users..." 
                                className="w-full text-xs p-1.5 border border-blue-500 rounded outline-none"
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                              {users.map((user) => (
                                <div 
                                  key={user.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAssigneeUpdate(project, user);
                                  }}
                                  className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                                >
                                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                    {user.avatar ? (
                                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <User size={16} className="text-[#1F2020]" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs  text-gray-900 truncate">
                                      {user.name} {user.id === 'user1' && <span className="text-gray-500">(Assign to me)</span>}
                                    </p>
                                    {user.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <span className={`p-1  rounded text-xs  ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t mt-auto">
                {activeAddStatus === status ? (
                  <div className="border rounded  p-2 bg-white shadow-sm border-blue-500">
                    <textarea
                      autoFocus
                      className="w-full text-xs  outline-none resize-none min-h-[60px]"
                      placeholder="What needs to be done?"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddNewTask(status);
                        }
                        if (e.key === 'Escape') {
                          setActiveAddStatus(null);
                          setNewTaskName('');
                        }
                      }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2 text-[#1F2020] relative">
                        <CheckSquare size={16} className="cursor-pointer hover:text-blue-500" />
                        <ChevronDown size={16} className="cursor-pointer hover:text-blue-500" />
                        <Calendar size={16} className="cursor-pointer hover:text-blue-500" />
                        <div className="relative">
                          {selectedAssignee?.avatar ? (
                            <img 
                              src={selectedAssignee.avatar} 
                              alt="selected" 
                              className="w-5 h-5 rounded-full cursor-pointer"
                              onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                            />
                          ) : (
                            <User 
                              size={16} 
                              className={`cursor-pointer hover:text-blue-500 ${isAssigneeDropdownOpen || selectedAssignee ? 'text-blue-500' : ''}`} 
                              onClick={() => setIsAssigneeDropdownOpen(!isAssigneeDropdownOpen)}
                            />
                          )}
                          
                          {isAssigneeDropdownOpen && (
                            <div className="absolute bottom-full left-0 mb-2 w-64 bg-white border border-gray-200 rounded shadow-lg z-50">
                              <div className="p-2">
                                <input 
                                  type="text" 
                                  placeholder="Search users..." 
                                  className="w-full text-xs p-1.5 border border-blue-500 rounded outline-none"
                                  autoFocus
                                />
                              </div>
                              <div className="max-h-48 overflow-y-auto">
                                {users.map((user) => (
                                  <div 
                                    key={user.id}
                                    onClick={() => {
                                      setSelectedAssignee(user.id === 'unassigned' ? null : user);
                                      setIsAssigneeDropdownOpen(false);
                                    }}
                                    className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                                      {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <User size={16} className="text-[#1F2020]" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs  text-gray-900 truncate">
                                        {user.name} {user.id === 'user1' && <span className="text-gray-500">(Assign to me)</span>}
                                      </p>
                                      {user.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleAddNewTask(status)}
                        className="p-1.5 bg-gray-100 rounded hover:bg-gray-200 text-gray-600"
                      >
                        <CornerDownLeft size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setActiveAddStatus(status)}
                    className="w-full p-2  border border-dashed border-gray-300 text-gray-700 rounded  hover:border-gray-400 hover:bg-gray-50 text-xs   transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    New Project
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="flex-shrink-0">
            <button 
              onClick={handleAddStatus}
              className="w-[300px] h-[52px] border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500 hover:border-red-500 hover:text-red-500 transition-colors bg-white/50"
            >
              <Plus size={20} className="mr-2" />
              Add Status
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KanbanPage;
