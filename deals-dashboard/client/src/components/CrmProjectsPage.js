import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, MoreVertical, Plus, Star } from 'lucide-react';
import projectsData from '../data/crmProjectsData.json';
import AddNewProjectModal from './AddNewProjectModal';
import { projectAPI } from '../services/api';

const CrmProjectsPage = () => {
  const [projects, setProjects] = useState(projectsData.projects);
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await projectAPI.getAll();
      if (Array.isArray(data) && data.length > 0) {
        setProjects([...projectsData.projects, ...data]);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return `$${(value / 100000).toFixed(0)},${String((value % 100000) / 1000).padStart(2, '0')}`;
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-gray-50 min-h-screen flex flex-col">
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
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all p-4 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-600 font-semibold">
                    {project.priority}
                  </span>
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-600 font-semibold">
                    {project.status}
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
                  <button className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded transition">
                    <MoreVertical size={16} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: project.avatarBg }}
                >
                  {project.initials}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{project.title}</h3>
                  <p className="text-xs text-gray-500">{project.subtitle}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>

              <div className="space-y-2 mb-4 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">⦿</span>
                  <span>Project ID : <span className="font-semibold text-gray-900">#{project.id}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">💰</span>
                  <span>Value : <span className="font-semibold text-gray-900">{formatCurrency(project.value)}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">📅</span>
                  <span>Due Date : <span className="font-semibold text-gray-900">{project.dueDate}</span></span>
                </div>
              </div>

              <div className="mt-auto">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex -space-x-2">
                    {[...Array(Math.min(project.members, 3))].map((_, i) => (
                      <img
                        key={i}
                        src={`https://i.pravatar.cc/32?img=${project.id * 3 + i}`}
                        alt="team member"
                        className="w-7 h-7 rounded-full border-2 border-white"
                      />
                    ))}
                    {project.members > 3 && (
                      <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 text-xs flex items-center justify-center text-gray-600 font-semibold">
                        +{project.members - 3}
                      </div>
                    )}
                  </div>
                  <span className="text-gray-400">🔗</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 font-semibold">
                    Total Hours : {project.totalHours}
                  </span>
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="text-sm cursor-pointer hover:text-gray-700">💬</span>
                    <span className="text-sm cursor-pointer hover:text-gray-700">👁️</span>
                    <span className="text-sm cursor-pointer hover:text-gray-700">⚙️</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
