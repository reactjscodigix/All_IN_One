import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

const AddProjectModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    projectType: '',
    client: '',
    category: '',
    projectTiming: '',
    price: '',
    responsiblePersons: [],
    teamLeader: '',
    startDate: '',
    dueDate: '',
    priority: '',
    status: '',
    description: '',
  });

  useEffect(() => {
    const formatDateForInput = (dateStr) => {
      if (!dateStr || dateStr === '0000-00-00') return '';
      try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
      } catch (e) {
        return '';
      }
    };

    if (initialData) {
      setFormData({
        name: initialData.name || initialData.title || '',
        projectId: initialData.project_id || initialData.projectId || initialData.id || '',
        projectType: initialData.project_type || initialData.projectType || '',
        client: initialData.company || initialData.client || '',
        category: initialData.category || '',
        projectTiming: initialData.projectTiming || '',
        price: initialData.budget || initialData.price || '',
        responsiblePersons: Array.isArray(initialData.responsible_persons) ? initialData.responsible_persons : 
                           (Array.isArray(initialData.responsiblePersons) ? initialData.responsiblePersons : []),
        teamLeader: initialData.team_leader || initialData.teamLeader || '',
        startDate: formatDateForInput(initialData.start_date || initialData.startDate),
        dueDate: formatDateForInput(initialData.due_date || initialData.dueDate),
        priority: initialData.priority || '',
        status: initialData.status || initialData.stage || '',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        name: '',
        projectId: '',
        projectType: '',
        client: '',
        category: '',
        projectTiming: '',
        price: '',
        responsiblePersons: [],
        teamLeader: '',
        startDate: '',
        dueDate: '',
        priority: '',
        status: '',
        description: '',
      });
    }
  }, [initialData, isOpen]);

  const [personInput, setPersonInput] = useState('');

  const teams = [
    { id: 1, name: 'Robert Johnson', color: 'bg-purple-500' },
    { id: 2, name: 'Darlee Robertson', color: 'bg-cyan-500' },
    { id: 3, name: 'Sarah Johnson', color: 'bg-pink-500' },
    { id: 4, name: 'Michael Chen', color: 'bg-blue-500' },
    { id: 5, name: 'Emily Rodriguez', color: 'bg-green-500' },
  ];

  const projectTypes = ['Web Development', 'Mobile App', 'Desktop Software', 'Cloud Migration', 'AI/ML Project'];
  const categories = ['Development', 'Design', 'Infrastructure', 'Consulting', 'Support'];
  const timings = ['Immediate', 'Short Term', 'Medium Term', 'Long Term'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPerson = (person) => {
    if (person && !formData.responsiblePersons.includes(person)) {
      setFormData(prev => ({
        ...prev,
        responsiblePersons: [...prev.responsiblePersons, person]
      }));
      setPersonInput('');
    }
  };

  const handleRemovePerson = (person) => {
    setFormData(prev => ({
      ...prev,
      responsiblePersons: prev.responsiblePersons.filter(p => p !== person)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    setFormData({
      name: '',
      projectId: '',
      projectType: '',
      client: '',
      category: '',
      projectTiming: '',
      price: '',
      responsiblePersons: [],
      teamLeader: '',
      startDate: '',
      dueDate: '',
      priority: '',
      status: '',
      description: '',
    });
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      projectId: '',
      projectType: '',
      client: '',
      category: '',
      projectTiming: '',
      price: '',
      responsiblePersons: [],
      teamLeader: '',
      startDate: '',
      dueDate: '',
      priority: '',
      status: '',
      description: '',
    });
    onClose();
  };

  const getTeamColor = (name) => {
    const team = teams.find(t => t.name === name);
    return team ? team.color : 'bg-gray-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20" onClick={handleCancel}>
      <div 
        className="h-full w-full md:w-[72%] lg:w-[60%] xl:w-[55%] bg-white shadow-xl overflow-y-auto border-l border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-2 border-b border-gray-200">
          <h2 className="text-md  text-gray-900">{initialData ? 'Edit Project' : 'Add New Project'}</h2>
          <button
            onClick={handleCancel}
            className="text-gray-500 text-2xl hover:text-red  transition-colors"
          >
            ×
          </button>
        </div>

        <form id="add-project-form" onSubmit={handleSubmit} className="p-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-xs    mb-2  text-gray-600">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Project name"
              className="w-full  p-2  border border-gray-300 rounded text-xs bg-white focus:ring-0 focus:border-gray-400"
            />
          </div>

          {/* Project ID */}
          <div>
            <label className="block text-xs    mb-2  text-gray-600">
              Project ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="projectId"
              value={formData.projectId}
              onChange={handleInputChange}
              placeholder="ID"
              className="w-full  p-2  border border-gray-300 rounded text-xs bg-white focus:ring-0 focus:border-gray-400"
            />
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-xs    mb-2  text-gray-600">
              Project Type <span className="text-red-500">*</span>
            </label>
            <select
              name="projectType"
              value={formData.projectType}
              onChange={handleInputChange}
              className="w-full  p-2  border border-gray-300 rounded text-xs bg-white focus:ring-0 focus:border-gray-400"
            >
              <option value="">Choose</option>
              {projectTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Client */}
          <div>
            <label className="block text-xs    mb-2  text-gray-600">
              Client <span className="text-red-500">*</span>
            </label>
            <select
              name="client"
              value={formData.client}
              onChange={handleInputChange}
              className="w-full  p-2  border border-gray-300 rounded text-xs bg-white focus:ring-0 focus:border-gray-400"
            >
              <option value="">Select</option>
              <option value="NovaWave LLC">NovaWave LLC</option>
              <option value="BlueSky">BlueSky</option>
              <option value="Silve Hawk">Silve Hawk</option>
              <option value="Summit Peak">Summit Peak</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs    mb-2  text-gray-600">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full  p-2  border border-gray-300 rounded text-xs bg-white focus:ring-0 focus:border-gray-400"
            >
              <option value="">Select</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Project Timing */}
          <div>
            <label className="block text-xs    mb-2  text-gray-600">
              Project Timing <span className="text-red-500">*</span>
            </label>
            <select
              name="projectTiming"
              value={formData.projectTiming}
              onChange={handleInputChange}
              className="w-full  p-2  border border-gray-300 rounded text-xs bg-white focus:ring-0 focus:border-gray-400"
            >
              <option value="">Select</option>
              {timings.map(timing => (
                <option key={timing} value={timing}>{timing}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div>
            <label className="block text-xs    mb-2  text-gray-600">
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder=""
              className="w-full  p-2  border border-gray-300 rounded text-xs bg-white focus:ring-0 focus:border-gray-400"
            />
          </div>

          {/* Responsible Persons */}
          <div className="md:col-span-2">
            <label className="block text-xs    mb-2  text-gray-600">
              Responsible Persons <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-3">
              <select
                value={personInput}
                onChange={(e) => setPersonInput(e.target.value)}
                className="flex-1  p-2  border border-gray-300 rounded text-xs bg-white focus:ring-0 focus:border-gray-400"
              >
                <option value="">Add person</option>
                {teams.map(team => (
                  <option key={team.id} value={team.name}>{team.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleAddPerson(personInput)}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center justify-center flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {formData.responsiblePersons.map(person => (
                <div key={person} className="flex items-center justify-between bg-red-50 border border-red-100 rounded px-3 py-2">
                  <span className="text-xs text-gray-700 flex items-center gap-2">
                    <span className={`w-5 h-5 ${getTeamColor(person)} rounded-full flex items-center justify-center text-white text-xs `}>
                      {person.charAt(0)}
                    </span>
                    {person}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemovePerson(person)}
                    className="text-red-400 hover:text-red  transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Team Leader */}
          <div className="md:col-span-2">
            <label className="block text-xs    mb-2  text-gray-600">
              Team Leader <span className="text-red-500">*</span>
            </label>
            <select
              name="teamLeader"
              value={formData.teamLeader}
              onChange={handleInputChange}
              className="w-full  p-2  border border-gray-300 rounded text-xs bg-white focus:ring-0 focus:border-gray-400"
            >
              <option value="">Select</option>
              {teams.map(team => (
                <option key={team.id} value={team.name}>{team.name}</option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-xs    mb-2  text-gray-600">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full  p-2  border border-gray-300 rounded text-xs bg-white focus:ring-0 focus:border-gray-400"
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs    mb-2  text-gray-600">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className="w-full  p-2  border border-gray-300 rounded text-xs bg-white focus:ring-0 focus:border-gray-400"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs    mb-2  text-gray-600">
              Priority
            </label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              className="w-full  p-2  border border-gray-300 rounded text-xs bg-white focus:ring-0 focus:border-gray-400"
            >
              <option value="">Select</option>
              {priorities.map(pri => (
                <option key={pri} value={pri}>{pri}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs    mb-2  text-gray-600">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full  p-2  border border-gray-300 rounded text-xs bg-white focus:ring-0 focus:border-gray-400"
            >
              <option value="">Select</option>
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs    mb-2  text-gray-600">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Description"
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded  text-xs  bg-white focus:ring-0 focus:border-gray-400 resize-none"
            ></textarea>
          </div>
        </form>

        <div className="p-6 flex justify-end gap-3 border-t border-gray-200 sticky bottom-0 bg-white">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded  text-xs  hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-project-form"
            className="p-2  bg-red-500 text-white rounded  text-xs  hover:bg-red-600 transition-colors"
          >
            {initialData ? 'Update Project' : 'Create New'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProjectModal;
