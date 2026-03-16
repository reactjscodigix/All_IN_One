import React, { useState, useEffect } from 'react';
import { projectAPI } from '../services/api';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const AddNewProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    project_id: '',
    project_type: '',
    client: '',
    category: '',
    project_timing: '',
    price: '',
    responsible_persons: [],
    team_leader: '',
    start_date: '',
    due_date: '',
    priority: '',
    status: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchUsersAndCompanies();
    }
  }, [isOpen]);

  const fetchUsersAndCompanies = async () => {
    setIsFetching(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const [usersRes, companiesRes] = await Promise.all([
        fetch(`${apiUrl}/contacts`),
        fetch(`${apiUrl}/companies`)
      ]);
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(Array.isArray(usersData) ? usersData : []);
      }
      
      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(Array.isArray(companiesData) ? companiesData : []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setUsers([]);
      setCompanies([]);
    } finally {
      setIsFetching(false);
    }
  };

  const projectTypes = [
    'Web Development',
    'Mobile App',
    'Desktop Application',
    'Data Analytics',
    'Cloud Migration',
    'API Integration',
    'UI/UX Design'
  ];

  const categories = [
    'Development',
    'Design',
    'Marketing',
    'Strategy',
    'Support',
    'Maintenance'
  ];

  const timings = [
    'Immediate',
    'Short Term (1-3 months)',
    'Medium Term (3-6 months)',
    'Long Term (6+ months)',
    'Ongoing'
  ];

  const priorities = ['High', 'Medium', 'Low'];
  const statuses = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getResponsiblePersonUser = (userId) => {
    return users.find(u => u.id === userId);
  };

  const getTeamLeaderUser = (userId) => {
    return users.find(u => u.id === userId);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPerson = (userId) => {
    const id = parseInt(userId);
    if (id && !formData.responsible_persons.includes(id)) {
      setFormData(prev => ({
        ...prev,
        responsible_persons: [...prev.responsible_persons, id]
      }));
    }
  };

  const handleRemovePerson = (userId) => {
    setFormData(prev => ({
      ...prev,
      responsible_persons: prev.responsible_persons.filter(p => p !== userId)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    if (!formData.project_id.trim()) {
      setError('Project ID is required');
      return;
    }

    if (!formData.price) {
      setError('Price is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (formData.responsible_persons.length === 0) {
      setError('At least one responsible person is required');
      return;
    }

    if (!formData.team_leader) {
      setError('Team leader is required');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: formData.name,
        project_id: formData.project_id,
        project_type: formData.project_type,
        client: formData.client,
        category: formData.category,
        project_timing: formData.project_timing,
        price: parseFloat(formData.price),
        responsible_persons: formData.responsible_persons,
        team_leader: parseInt(formData.team_leader),
        start_date: formData.start_date,
        due_date: formData.due_date,
        priority: formData.priority,
        status: formData.status || 'Planning',
        description: formData.description,
      };

      await projectAPI.create(payload);

      if (onSuccess) {
        onSuccess();
      }
      showSuccessToast(`Project "${formData.name}" created successfully!`);
      handleCancel();
    } catch (err) {
      const errorMessage = err.message || 'Failed to create project';
      setError(errorMessage);
      showErrorToast(errorMessage);
      console.error('Form submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      project_id: '',
      project_type: '',
      client: '',
      category: '',
      project_timing: '',
      price: '',
      responsible_persons: [],
      team_leader: '',
      start_date: '',
      due_date: '',
      priority: '',
      status: '',
      description: '',
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onClick={handleCancel}>
      <div
        className="h-full w-full md:w-[72%] lg:w-[60%] xl:w-[55%] bg-white shadow-xl overflow-y-auto border-l border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-centerp-3  border-b border-[#EAECF0] sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <h2 className="text-md  text-gray-900">Add New Project</h2>
            {isFetching && <span className="text-xs text-gray-500">(Loading data...)</span>}
          </div>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="text-[#1F2020] hover:text-red  transition-colors text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="p-2 m-4 bg-red-50 border border-red-200 rounded ">
            <p className="text-xs  text-red-700  ">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs   text-gray-900 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isFetching}
              placeholder="Enter project name"
              className="w-full p-2  border border-gray-300 rounded  text-xs  bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs   text-gray-900 mb-1">
                Project ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="project_id"
                value={formData.project_id}
                onChange={handleInputChange}
                disabled={isFetching}
                placeholder="e.g., #12145"
                className="w-full p-2  border border-gray-300 rounded  text-xs  bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs   text-gray-900 mb-1">
                Project Type <span className="text-red-500">*</span>
              </label>
              <select
                name="project_type"
                value={formData.project_type}
                onChange={handleInputChange}
                disabled={isFetching}
                className="w-full p-2  border border-gray-300 rounded  text-xs  bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition disabled:opacity-50"
              >
                <option value="">Choose</option>
                {projectTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs   text-gray-900 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                disabled={isFetching}
                className="w-full p-2  border border-gray-300 rounded  text-xs  bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition disabled:opacity-50"
              >
                <option value="">{isFetching ? 'Loading companies...' : 'Select'}</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.company_name || company.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs   text-gray-900 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={isFetching}
                className="w-full p-2  border border-gray-300 rounded  text-xs  bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition disabled:opacity-50"
              >
                <option value="">Select</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs   text-gray-900 mb-1">
                Project Timing <span className="text-red-500">*</span>
              </label>
              <select
                name="project_timing"
                value={formData.project_timing}
                onChange={handleInputChange}
                disabled={isFetching}
                className="w-full p-2  border border-gray-300 rounded  text-xs  bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition disabled:opacity-50"
              >
                <option value="">Select</option>
                {timings.map(timing => (
                  <option key={timing} value={timing}>{timing}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs   text-gray-900 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                disabled={isFetching}
                placeholder="0"
                className="w-full p-2  border border-gray-300 rounded  text-xs  bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs   text-gray-900 mb-2">
              Responsible Persons <span className="text-red-500">*</span>
            </label>
            <div className="mb-3">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) handleAddPerson(e.target.value);
                  e.target.value = '';
                }}
                disabled={isFetching || users.length === 0}
                className="w-full p-2  border border-gray-300 rounded  text-xs  bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition disabled:opacity-50"
              >
                <option value="">{isFetching ? 'Loading users...' : '+ Add person'}</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>
            {formData.responsible_persons.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.responsible_persons.map((userId) => {
                  const user = getResponsiblePersonUser(userId);
                  return user ? (
                    <div key={userId} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs  border border-blue-200">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs  flex-shrink-0">
                        {getInitials(user.first_name, user.last_name)}
                      </div>
                      <span>{user.first_name} {user.last_name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePerson(userId)}
                        className="text-blue-500 hover:text-red  "
                      >
                        ×
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs   text-gray-900 mb-1">
              Team Leader <span className="text-red-500">*</span>
            </label>
            {formData.team_leader ? (
              (() => {
                const teamLeader = getTeamLeaderUser(parseInt(formData.team_leader));
                return teamLeader ? (
                  <div className="relative mb-3">
                    <div className="flex items-center gap-2 p-2  border border-gray-300 rounded  bg-gray-50">
                      <div className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-xs   flex-shrink-0">
                        {getInitials(teamLeader.first_name, teamLeader.last_name)}
                      </div>
                      <span className="text-xs  text-gray-900 flex-1">{teamLeader.first_name} {teamLeader.last_name}</span>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, team_leader: '' }))}
                        className="text-[#1F2020] hover:text-red "
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : null;
              })()
            ) : (
              <select
                value=""
                onChange={(e) => setFormData(prev => ({ ...prev, team_leader: e.target.value }))}
                disabled={isFetching || users.length === 0}
                className="w-full p-2  border border-gray-300 rounded  text-xs  bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition disabled:opacity-50"
              >
                <option value="">{isFetching ? 'Loading team members...' : 'Select'}</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs   text-gray-900 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                disabled={isFetching}
                className="w-full p-2  border border-gray-300 rounded  text-xs  bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs   text-gray-900 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                disabled={isFetching}
                className="w-full p-2  border border-gray-300 rounded  text-xs  bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition disabled:opacity-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs   text-gray-900 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={isFetching}
                className="w-full p-2  border border-gray-300 rounded  text-xs  bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition disabled:opacity-50"
              >
                <option value="">Select</option>
                {priorities.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs   text-gray-900 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={isFetching}
                className="w-full p-2  border border-gray-300 rounded  text-xs  bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition disabled:opacity-50"
              >
                <option value="">Select</option>
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs   text-gray-900 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isFetching}
              placeholder="Description"
              rows="4"
              className="w-full p-2  border border-gray-300 rounded  text-xs  bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition resize-none disabled:opacity-50"
            />
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading || isFetching}
              className="p-2  text-gray-700   border border-gray-300 rounded  hover:bg-gray-50 transition disabled:opacity-50 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || isFetching || users.length === 0}
              className="p-2  bg-red-600 text-white   rounded  hover:bg-red-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : isFetching ? 'Loading data...' : 'Create New'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewProjectModal;
