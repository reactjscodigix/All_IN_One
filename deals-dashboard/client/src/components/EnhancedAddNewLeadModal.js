import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../utils/toast';

const EnhancedAddNewLeadModal = ({ isOpen, onClose, onLeadAdded }) => {
  const [formData, setFormData] = useState({
    lead_name: '',
    email: '',
    phone: '',
    company: '',
    lead_source: 'Website',
    service_category_id: '',
    rating: 5,
    notes: ''
  });
  
  const [serviceCategories, setServiceCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [suggestedDept, setSuggestedDept] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDependencies();
    }
  }, [isOpen]);

  const fetchDependencies = async () => {
    try {
      const [categoriesRes, deptRes] = await Promise.all([
        fetch('/api/service-categories'),
        fetch('/api/departments')
      ]);
      
      const categories = await categoriesRes.json();
      const depts = await deptRes.json();
      
      setServiceCategories(categories);
      setDepartments(depts);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleServiceChange = (e) => {
    const categoryId = e.target.value;
    setFormData(prev => ({ ...prev, service_category_id: categoryId }));
    
    if (categoryId) {
      const category = serviceCategories.find(c => c.id == categoryId);
      if (category && category.suggested_department_id) {
        const dept = departments.find(d => d.id === category.suggested_department_id);
        setSuggestedDept(dept);
      }
    } else {
      setSuggestedDept(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Failed to create lead');
      
      const newLead = await response.json();
      showSuccessToast(`Lead "${formData.lead_name}" created successfully!`);
      
      setFormData({
        lead_name: '',
        email: '',
        phone: '',
        company: '',
        lead_source: 'Website',
        service_category_id: '',
        rating: 5,
        notes: ''
      });
      setSuggestedDept(null);
      
      onLeadAdded(newLead);
      onClose();
    } catch (error) {
      showErrorToast('Failed to create lead: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded  shadow-xl w-full max-w-2xl max-h-96 overflow-y-auto">
        <div className="sticky top-0 bg-white border-bp-2   flex justify-between items-center">
          <h2 className="text-xl  text-gray-800">Create New Lead</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Lead Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm  text-gray-700 mb-1">
                Lead Name *
              </label>
              <input
                type="text"
                name="lead_name"
                value={formData.lead_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm  text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm  text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm  text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Service Category Selection */}
          <div>
            <label className="block text-sm  text-gray-700 mb-1">
              Service Category
            </label>
            <select
              name="service_category_id"
              value={formData.service_category_id}
              onChange={handleServiceChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">Select a service category</option>
              {serviceCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.parent_category} - {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Suggestion */}
          {suggestedDept && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 flex gap-2">
              <AlertCircle size={20} className="text-white  flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm  text-blue-900">Suggested Department</p>
                <p className="text-sm text-blue-700">{suggestedDept.name}</p>
              </div>
            </div>
          )}

          {/* Other Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm  text-gray-700 mb-1">
                Lead Source
              </label>
              <select
                name="lead_source"
                value={formData.lead_source}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option>Website</option>
                <option>LinkedIn</option>
                <option>Referral</option>
                <option>Cold Call</option>
                <option>Email</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm  text-gray-700 mb-1">
                Rating
              </label>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {[1, 2, 3, 4, 5].map(i => (
                  <option key={i} value={i}>{i} Stars</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm  text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2 rounded-md  hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Lead'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 py-2 rounded-md  text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedAddNewLeadModal;
