import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const AddNewTaskModal = ({ isOpen, onClose, onSubmit, initialData = null, deals = [], projects = [], users = [] }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [allUsers, setAllUsers] = useState(users);
  const [allDeals, setAllDeals] = useState(deals);
  const [allProjects, setAllProjects] = useState(projects);
  const [allLeads, setAllLeads] = useState([]);
  const [allQuotations, setAllQuotations] = useState([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    assigned_to: [],
    due_date: '',
    due_time: '',
    linked_type: 'General',
    linked_id: '',
    tags: [],
    task_type: 'General',
    next_followup_date: '',
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        let assigned = [];
        try {
          assigned = typeof initialData.assigned_to === 'string' 
            ? JSON.parse(initialData.assigned_to) 
            : (Array.isArray(initialData.assigned_to) ? initialData.assigned_to : [initialData.assigned_to]);
          assigned = assigned.map(id => parseInt(id)).filter(Boolean);
        } catch (e) {
          assigned = initialData.assigned_to ? [parseInt(initialData.assigned_to)] : [];
        }

        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          priority: initialData.priority || 'Medium',
          status: initialData.status || 'Open',
          assigned_to: assigned,
          due_date: initialData.due_date ? initialData.due_date.substring(0, 10) : '',
          due_time: initialData.due_time || '',
          linked_type: initialData.linked_type || 'General',
          linked_id: initialData.linked_id || '',
          tags: Array.isArray(initialData.tags) ? initialData.tags : [],
          task_type: initialData.task_type || 'General',
          next_followup_date: initialData.next_followup_date ? initialData.next_followup_date.substring(0, 10) : '',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          priority: 'Medium',
          status: 'Open',
          assigned_to: [],
          due_date: '',
          due_time: '',
          linked_type: 'General',
          linked_id: '',
          tags: [],
          task_type: 'General',
          next_followup_date: '',
        });
      }
      fetchData();
    }
  }, [isOpen, initialData]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const [usersRes, dealsRes, projectsRes, leadsRes, estimationsRes] = await Promise.all([
        fetch(`${apiUrl}/contacts`).then(r => r.json()),
        fetch(`${apiUrl}/deals`).then(r => r.json()),
        fetch(`${apiUrl}/projects`).then(r => r.json()),
        fetch(`${apiUrl}/leads`).then(r => r.json()),
        fetch(`${apiUrl}/estimations`).then(r => r.json()),
      ]).catch(err => {
        console.error('Error fetching data:', err);
        return [[], [], [], [], []];
      });

      setAllUsers(Array.isArray(usersRes) ? usersRes : []);
      setAllDeals(Array.isArray(dealsRes) ? dealsRes : []);
      setAllProjects(Array.isArray(projectsRes) ? projectsRes : []);
      setAllLeads(Array.isArray(leadsRes) ? leadsRes : []);
      setAllQuotations(Array.isArray(estimationsRes) ? estimationsRes : []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAssigneeToggle = (userId) => {
    setFormData(prev => ({
      ...prev,
      assigned_to: prev.assigned_to.includes(userId)
        ? prev.assigned_to.filter(id => id !== userId)
        : [...prev.assigned_to, userId]
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (formData.linked_type !== 'General' && !formData.linked_id) {
      setError(`Please select a ${formData.linked_type} to link`);
      return;
    }

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      handleCancel();
    } catch (err) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Open',
      assigned_to: [],
      due_date: '',
      due_time: '',
      linked_type: 'General',
      linked_id: '',
      tags: [],
      task_type: 'General',
      next_followup_date: '',
    });
    setError('');
    setTagInput('');
    onClose();
  };

  const getAssignedUsers = () => {
    return formData.assigned_to
      .map(id => allUsers.find(u => u.id === parseInt(id)))
      .filter(Boolean);
  };

  const getLinkedName = () => {
    if (formData.linked_type === 'Deal' && formData.linked_id) {
      const deal = allDeals.find(d => d.id === parseInt(formData.linked_id));
      return deal ? deal.name || deal.title : '';
    } else if (formData.linked_type === 'Project' && formData.linked_id) {
      const project = allProjects.find(p => p.id === parseInt(formData.linked_id));
      return project ? project.name || project.title : '';
    } else if (formData.linked_type === 'Lead' && formData.linked_id) {
      const lead = allLeads.find(l => l.id === parseInt(formData.linked_id));
      return lead ? lead.lead_name || lead.name : '';
    } else if (formData.linked_type === 'Quotation' && formData.linked_id) {
      const quotation = allQuotations.find(q => q.id === parseInt(formData.linked_id));
      return quotation ? quotation.quotation_number || quotation.title : '';
    }
    return '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
      <div className="h-full w-full md:w-[72%] lg:w-[60%] xl:w-[55%] bg-white shadow-xl overflow-y-auto border-l border-gray-200">
        <div className="flex justify-between items-center p-3  border-b border-[#EAECF0] sticky top-0 bg-white z-10">
          <h2 className="text-md  text-gray-900">{initialData ? 'Edit Task' : 'Create New Task'}</h2>
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

        {loadingData && (
          <div className="p-6 text-center text-gray-600">Loading data...</div>
        )}

        {!loadingData && (
          <form onSubmit={handleSubmit} className="p-3 space-y-5">
            <div>
              <label className="block text-xs    text-gray-700 mb-2">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter task title"
                className="w-full p-2 border border-gray-300 rounded  text-xs bg-white focus:outline-none focus:border-red-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs    text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter task description"
                rows="3"
                className="w-full p-2 border border-gray-300 rounded  text-xs bg-white focus:outline-none focus:border-red-500 transition resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs    text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded  text-xs bg-white focus:outline-none focus:border-red-500 transition"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-xs    text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded  text-xs bg-white focus:outline-none focus:border-red-500 transition"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Converted to Deal">Converted to Deal</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs    text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded  text-xs bg-white focus:outline-none focus:border-red-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs    text-gray-700 mb-2">
                  Next Followup Date
                </label>
                <input
                  type="date"
                  name="next_followup_date"
                  value={formData.next_followup_date}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded  text-xs bg-white focus:outline-none focus:border-red-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs    text-gray-700 mb-2">
                Task Type
              </label>
              <select
                name="task_type"
                value={formData.task_type}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded  text-xs bg-white focus:outline-none focus:border-red-500 transition"
              >
                <option value="General">General</option>
                <option value="Call">Call</option>
                <option value="Message">Message</option>
                <option value="Google Meet">Google Meet</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-xs    text-gray-700">
                Link to
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="linked_type"
                    value="General"
                    checked={formData.linked_type === 'General'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-xs  text-gray-700">General Task</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="linked_type"
                    value="Deal"
                    checked={formData.linked_type === 'Deal'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-xs  text-gray-700">Link to Deal</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="linked_type"
                    value="Project"
                    checked={formData.linked_type === 'Project'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-xs  text-gray-700">Link to Project</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="linked_type"
                    value="Lead"
                    checked={formData.linked_type === 'Lead'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-xs  text-gray-700">Link to Lead</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="linked_type"
                    value="Quotation"
                    checked={formData.linked_type === 'Quotation'}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <span className="text-xs  text-gray-700">Link to Quotation</span>
                </label>
              </div>

              {formData.linked_type !== 'General' && (
                <select
                  name="linked_id"
                  value={formData.linked_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded  text-xs bg-white focus:outline-none focus:border-red-500 transition"
                >
                  <option value="">
                    Select {formData.linked_type}
                  </option>
                  {(formData.linked_type === 'Deal' ? allDeals : 
                    formData.linked_type === 'Project' ? allProjects : 
                    formData.linked_type === 'Lead' ? allLeads : 
                    allQuotations).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.quotation_number || item.lead_name || item.name || item.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-xs    text-gray-700 mb-2">
                Assign to
              </label>
              <div className="space-y-2">
                {allUsers.length > 0 ? (
                  <div className="border border-gray-300 rounded  p-3 max-h-48 overflow-y-auto space-y-2">
                    {allUsers.map(user => (
                      <label key={user.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.assigned_to.includes(user.id)}
                          onChange={() => handleAssigneeToggle(user.id)}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs ">
                          {`${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`}
                        </div>
                        <span className="text-xs  text-gray-700">
                          {user.first_name} {user.last_name}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs  text-gray-500">No users available</p>
                )}

                {getAssignedUsers().length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded ">
                    {getAssignedUsers().map(user => (
                      <div key={user.id} className="bg-red-50 text-red-700 p-1  rounded-full text-xs flex items-center gap-1 border border-red-200">
                        {user.first_name} {user.last_name}
                        <button
                          type="button"
                          onClick={() => handleAssigneeToggle(user.id)}
                          className="text-red  hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs    text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag and press Enter"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded  text-xs  bg-white focus:outline-none focus:border-red-500 transition"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-3 py-2 bg-red-50 text-red  rounded  hover:bg-red-100 transition text-xs   "
                >
                  <Plus size={16} />
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, idx) => (
                    <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs flex items-center gap-2 border border-blue-200">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-white  hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 p-2  border border-gray-300 rounded  text-xs    text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 p-2  bg-red-600 text-white rounded  text-xs    hover:bg-red-700 transition disabled:opacity-50"
              >
                {isLoading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Task' : 'Create Task')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddNewTaskModal;
