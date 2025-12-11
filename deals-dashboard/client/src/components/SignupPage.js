import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, User, LogIn, Check, AlertCircle, Plus, X } from 'lucide-react';
import AddNewDealModal from './AddNewDealModal';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Employee',
    phone: '',
    company: '',
    companyId: null,
    projects: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [projectInput, setProjectInput] = useState('');
  const [deals, setDeals] = useState([]);

  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  const ROLES = [
    { id: 'Super Admin', label: 'Super Admin', color: 'red' },
    { id: 'Admin', label: 'Admin', color: 'orange' },
    { id: 'Deal Manager', label: 'Deal Manager', color: 'purple' },
    { id: 'Project Manager', label: 'Project Manager', color: 'green' },
    { id: 'Employee', label: 'Employee', color: 'cyan' },
  ];

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setPasswordsMatch(formData.password === formData.confirmPassword || formData.confirmPassword === '');
  }, [formData.password, formData.confirmPassword]);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/deals`);
      if (response.ok) {
        const data = await response.json();
        setDeals(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }
    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Invalid email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleRoleChange = (roleId) => {
    setFormData(prev => ({
      ...prev,
      role: roleId
    }));
  };

  const handleAddProject = (e) => {
    if (e.key === 'Enter' && projectInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        projects: [...prev.projects, projectInput.trim()]
      }));
      setProjectInput('');
    }
  };

  const handleRemoveProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  const handleDealSubmit = async (dealData) => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/deals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dealData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create deal');
      }

      const newDeal = await response.json();
      setSelectedDeals(prev => [...prev, newDeal]);
      setIsDealModalOpen(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to create deal');
      console.error('Deal creation error:', err);
    }
  };

  const handleRemoveDeal = (dealId) => {
    setSelectedDeals(prev => prev.filter(deal => deal.id !== dealId));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      console.error('Form validation failed');
      setLoading(false);
      return;
    }

    console.log('Form validation passed, proceeding with signup');
    console.log('Form data:', { 
      firstName: formData.firstName, 
      lastName: formData.lastName, 
      email: formData.email, 
      role: formData.role,
      passwordLength: formData.password.length
    });

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      const response = await fetch(`${apiUrl}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          password: formData.password,
          role_name: formData.role,
          phone: formData.phone || null,
          company: formData.company || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Signup API error:', data);
        throw new Error(data.error || 'Signup failed');
      }

      const userData = await response.json();
      console.log('Signup response:', userData);

      console.log('Signup response received:', userData);
      console.log('Received ID - type:', typeof userData.id, 'value:', userData.id);

      const numericId = typeof userData.id === 'string' ? parseInt(userData.id) : userData.id;
      
      if (isNaN(numericId)) {
        throw new Error(`Invalid user ID received from server: ${userData.id}`);
      }

      const roleFromResponse = userData.role_name || formData.role;
      const validRoles = ['Super Admin', 'Admin', 'Deal Manager', 'Project Manager', 'Employee'];
      const finalRole = validRoles.includes(roleFromResponse) ? roleFromResponse : 'Employee';

      const loginData = {
        id: numericId,
        email: userData.email,
        name: userData.first_name,
        role: finalRole,
        avatar: userData.avatar || `https://i.pravatar.cc/150?u=${userData.email}`,
      };

      console.log('Logging in user with data (after conversion):', loginData);
      console.log('Final role set to:', finalRole);
      login(loginData);
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectedRole = ROLES.find(r => r.id === formData.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-lg mb-4">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-lg">
              D
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join Deals Dashboard with Role-Based Access</p>
        </div>

        <form onSubmit={handleSignup} className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="John"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Doe"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Your Company"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Role
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleChange(role.id)}
                    className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      formData.role === role.id
                        ? `border-${role.color}-500 bg-${role.color}-50 text-${role.color}-700`
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {formData.role === role.id && <Check size={16} />}
                      {role.label}
                    </div>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Selected: <span className="font-semibold">{selectedRole?.label}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Projects (Optional)
              </label>
              <input
                type="text"
                value={projectInput}
                onChange={(e) => setProjectInput(e.target.value)}
                onKeyPress={handleAddProject}
                placeholder="Type project name and press Enter"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              {formData.projects.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.projects.map((project, index) => (
                    <span key={index} className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {project}
                      <button
                        type="button"
                        onClick={() => handleRemoveProject(index)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Deals (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setIsDealModalOpen(true)}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  <Plus size={16} /> Add New Deal
                </button>
              </div>
              {selectedDeals.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDeals.map((deal) => (
                    <span key={deal.id} className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {deal.deal_name || deal.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveDeal(deal.id)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {selectedDeals.length === 0 && (
                <p className="text-xs text-gray-500 mt-2">No deals added yet</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
                      formData.confirmPassword && !passwordsMatch
                        ? 'border-red-300 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-red-500'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-sm"
                  >
                    {showConfirmPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {formData.confirmPassword && !passwordsMatch && (
                  <p className="mt-1 text-xs text-red-600">Passwords do not match</p>
                )}
                {formData.confirmPassword && passwordsMatch && (
                  <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                    <Check size={12} /> Passwords match
                  </p>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (formData.confirmPassword && !passwordsMatch)}
            className="w-full mt-8 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            <LogIn size={18} />
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-red-600 font-semibold hover:text-red-700 transition-colors">
                Sign In
              </Link>
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-green-900">
                  💬 Real-Time Chat Features
                </p>
                <ul className="text-xs text-green-800 space-y-1 ml-4 list-disc">
                  <li>Instant messaging with team members</li>
                  <li>Conversation history and management</li>
                  <li>Message read status tracking</li>
                  <li>One-on-one and group conversations</li>
                </ul>
                <p className="text-xs text-green-800 mt-2">
                  After signup, navigate to the <strong>Chat</strong> section in the sidebar to start messaging!
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> Select your role carefully. You can request role changes from the administrator after account creation.
              </p>
            </div>
          </div>
        </form>

        <AddNewDealModal
          isOpen={isDealModalOpen}
          onClose={() => setIsDealModalOpen(false)}
          onSubmit={handleDealSubmit}
          contacts={[]}
          projects={formData.projects}
          companies={[]}
          isCompanyContext={true}
        />
      </div>
    </div>
  );
};

export default SignupPage;
