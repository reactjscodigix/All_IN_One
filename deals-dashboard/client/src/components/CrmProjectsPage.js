import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreVertical, Plus, Star } from 'lucide-react';
import AddNewProjectModal from './AddNewProjectModal';
import { projectAPI } from '../services/api';

const CrmProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const target = e.target;
      if (!target.closest('[data-menu-trigger]') && !target.closest('[data-menu-content]')) {
        setOpenMenuId(null);
      }
    };
    
    if (openMenuId) {
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await projectAPI.getAll();
      
      let projectsList = data;
      if (!Array.isArray(data)) {
        projectsList = data?.data || data?.projects || [];
      }
      
      if (Array.isArray(projectsList)) {
        setProjects(projectsList);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('❌ Failed to load projects:', error);
      setError('Failed to load projects: ' + error.message);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatPrice = (price) => {
    if (!price) return '$0';
    return `$${(price / 100000).toFixed(0)},${String((price % 100000) / 1000).padStart(2, '0')}`;
  };

  const getProjectDisplay = (project) => {
    const price = project.price || project.value || 0;
    const dueDate = project.due_date || project.dueDate || project.end_date;
    const teamLeader = project.team_leader;
    const responsiblePersons = project.responsible_persons || [];
    const teamMembers = responsiblePersons.length > 0 ? responsiblePersons.length : (project.members || 0);
    
    return {
      title: project.title || project.name || 'Untitled Project',
      subtitle: project.subtitle || project.project_type || 'Project',
      description: project.description || 'No description',
      priority: project.priority || 'Medium',
      status: project.status || 'Planning',
      value: price,
      dueDate: formatDate(dueDate),
      members: teamMembers,
      totalHours: project.totalHours || 0,
      teamLeader: teamLeader,
      responsiblePersons: responsiblePersons,
      initials: project.initials || (project.name || 'P').substring(0, 2).toUpperCase(),
      avatarBg: project.avatarBg || '#F97316'
    };
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleEditProject = (projectId) => {
    console.log('Edit project:', projectId);
    setOpenMenuId(null);
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setOpenMenuId(null);
    }
  };

  const handleCloneProject = (project) => {
    const clonedProject = {
      ...project,
      id: Math.max(...projects.map(p => p.id), 0) + 1,
      title: `${project.title} (Copy)`
    };
    setProjects(prev => [...prev, clonedProject]);
    setOpenMenuId(null);
  };

  const handlePrintProject = (project) => {
    console.log('Print project:', project);
    window.print();
    setOpenMenuId(null);
  };

  const handleAddTask = (projectId) => {
    console.log('Add task to project:', projectId);
    setOpenMenuId(null);
  };

  const filteredProjects = projects.filter(p => {
    const projectTitle = (p.title || p.name || '').toLowerCase();
    return projectTitle.includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="w-full bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen flex flex-col">
      {error && (
        <div className="px-6 pt-6 pb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">❌ {error}</p>
          </div>
        </div>
      )}

      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded text-sm font-bold">125</span>
            </div>
            <div className="flex items-center gap-1 text-sm mt-1">
              <button className="text-orange-500 hover:text-orange-600 font-medium bg-transparent border-none cursor-pointer p-0">Home</button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-600">Projects</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition bg-white flex items-center gap-2">
              <Download size={16} /> Export
            </button>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition">
              ⟳
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition text-sm">
              <Plus size={16} /> Add New Project
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition bg-white flex items-center gap-2">
            <Filter size={16} /> Filter
          </button>
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-400 text-sm bg-white"
            />
          </div>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition">
            ≡
          </button>
          <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition">
            ⊞
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map(project => {
            const display = getProjectDisplay(project);
            return (
            <div
              key={project.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 flex flex-col relative overflow-visible"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 font-semibold">
                    {display.priority}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-600 font-semibold">
                    {display.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(project.id)}
                    className="text-gray-300 hover:text-yellow-400 transition"
                  >
                    {favorites[project.id] ? (
                      <Star size={18} className="fill-yellow-400 text-yellow-400" />
                    ) : (
                      <Star size={18} />
                    )}
                  </button>
                  <div className="relative" data-menu-container>
                    <button
                      data-menu-trigger
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === project.id ? null : project.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded transition"
                    >
                      <MoreVertical size={16} strokeWidth={1.5} />
                    </button>
                    {openMenuId === project.id && (
                      <div
                        data-menu-content
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project.id);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 first:rounded-t-lg"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-b border-gray-100"
                        >
                          🗑️ Delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCloneProject(project);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                        >
                          📋 Clone this Project
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintProject(project);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                        >
                          🖨️ Print
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddTask(project.id);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 last:rounded-b-lg"
                        >
                          ➕ Add New Task
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: display.avatarBg }}
                >
                  {display.initials}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{display.title}</h3>
                  <p className="text-xs text-gray-500">{display.subtitle}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{display.description}</p>

              <div className="space-y-2 mb-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">⦿</span>
                  <span>Project ID : <span className="font-semibold text-gray-900">#{project.id}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">💰</span>
                  <span>Value : <span className="font-semibold text-gray-900">{formatPrice(display.value)}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📅</span>
                  <span>Due Date : <span className="font-semibold text-gray-900">{display.dueDate}</span></span>
                </div>
              </div>

              <div className="mt-auto">
                {display.members > 0 && (
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex -space-x-2">
                      {display.members <= 3 && (
                        <>
                          {[...Array(display.members)].map((_, i) => (
                            <div
                              key={i}
                              className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs flex items-center justify-center font-semibold"
                              title={`Team Member ${i + 1}`}
                            >
                              {String.fromCharCode(65 + i)}
                            </div>
                          ))}
                        </>
                      )}
                      {display.members > 3 && (
                        <>
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-7 h-7 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-blue-600 text-white text-xs flex items-center justify-center font-semibold"
                              title={`Team Member ${i + 1}`}
                            >
                              {String.fromCharCode(65 + i)}
                            </div>
                          ))}
                          <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 text-xs flex items-center justify-center text-gray-600 font-semibold hover:bg-gray-300 transition cursor-pointer">
                            +{display.members - 3}
                          </div>
                        </>
                      )}
                    </div>
                    <span className="text-gray-400">🔗</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    {display.totalHours > 0 && (
                      <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold">
                        ⏱️ {display.totalHours} Hrs
                      </span>
                    )}
                    {display.members > 0 && (
                      <span className="text-xs px-2 py-1 rounded bg-green-50 text-green-600 font-semibold">
                        👥 {display.members} Team
                      </span>
                    )}
                    {display.totalHours === 0 && display.members === 0 && (
                      <span className="text-xs px-2 py-1 rounded bg-gray-50 text-gray-500 font-semibold">
                        No data yet
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-sm cursor-pointer hover:text-gray-700">💬</span>
                    <span className="text-sm cursor-pointer hover:text-gray-700">👁️</span>
                    <span className="text-sm cursor-pointer hover:text-gray-700">⚙️</span>
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-8">
          <button className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition text-sm">
            Load More
          </button>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-white text-center">
        <p className="text-xs text-gray-500">Copyright © 2025 <span className="text-red-600 font-semibold">Preadmin</span></p>
      </div>

      <AddNewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          loadProjects();
        }}
      />
    </div>
  );
};

export default CrmProjectsPage;
