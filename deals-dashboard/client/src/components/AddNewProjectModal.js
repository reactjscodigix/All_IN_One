import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';
import { projectAPI } from '../services/api';

const AddNewProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const [newPerson, setNewPerson] = useState('');

  const projectTypes = [
    'Web Development',
    'Mobile App',
    'Desktop Application',
    'Data Analytics',
    'Cloud Migration',
    'API Integration',
    'UI/UX Design'
  ];

  const clients = [
    'Acme Corporation',
    'Tech Solutions Inc',
    'Digital Innovations',
    'Global Enterprises',
    'StartUp Labs',
    'Enterprise Solutions'
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

  const teamMembers = [
    { id: 1, name: 'Robert Johnson', avatar: 'https://i.pravatar.cc/40?img=1' },
    { id: 2, name: 'Darlee Robertson', avatar: 'https://i.pravatar.cc/40?img=2' },
    { id: 3, name: 'Sarah Williams', avatar: 'https://i.pravatar.cc/40?img=3' },
    { id: 4, name: 'Michael Davis', avatar: 'https://i.pravatar.cc/40?img=4' },
    { id: 5, name: 'Emily Chen', avatar: 'https://i.pravatar.cc/40?img=5' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPerson = (person) => {
    if (person && !formData.responsible_persons.includes(person)) {
      setFormData(prev => ({
        ...prev,
        responsible_persons: [...prev.responsible_persons, person]
      }));
    }
  };

  const handleRemovePerson = (person) => {
    setFormData(prev => ({
      ...prev,
      responsible_persons: prev.responsible_persons.filter(p => p !== person)
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
        team_leader: formData.team_leader,
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
      handleCancel();
    } catch (err) {
      setError(err.message || 'Failed to create project');
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
    setNewPerson('');
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
        <div className="flex justify-between items-center p-6 border-b border-[#EAECF0] sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">Add New Project</h2>
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-red-600 transition-colors text-2xl disabled:opacity-50"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter project name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Project ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="project_id"
                value={formData.project_id}
                onChange={handleInputChange}
                placeholder="e.g., #12145"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Project Type <span className="text-red-500">*</span>
              </label>
              <select
                name="project_type"
                value={formData.project_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
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
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                name="client"
                value={formData.client}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              >
                <option value="">Select</option>
                {clients.map(client => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
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
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Project Timing <span className="text-red-500">*</span>
              </label>
              <select
                name="project_timing"
                value={formData.project_timing}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              >
                <option value="">Select</option>
                {timings.map(timing => (
                  <option key={timing} value={timing}>{timing}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Responsible Persons <span className="text-red-500">*</span>
            </label>
            <div className="mb-3">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) handleAddPerson(e.target.value);
                  e.target.value = '';
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              >
                <option value="">+ Add person</option>
                {teamMembers.map(member => (
                  <option key={member.id} value={member.name}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            {formData.responsible_persons.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.responsible_persons.map((person, idx) => (
                  <span key={idx} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200">
                    <span>👤</span>
                    {person}
                    <button
                      type="button"
                      onClick={() => handleRemovePerson(person)}
                      className="text-blue-500 hover:text-red-600 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Team Leader <span className="text-red-500">*</span>
            </label>
            <select
              name="team_leader"
              value={formData.team_leader}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
            >
              <option value="">Select</option>
              {teamMembers.map(member => (
                <option key={member.id} value={member.name}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              >
                <option value="">Select</option>
                {priorities.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              >
                <option value="">Select</option>
                {statuses.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description"
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition resize-none"
            />
          </div>

          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-6 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create New'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewProjectModal;
