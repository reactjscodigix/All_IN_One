import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, LogIn } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const userData = await response.json();
      
      const validRoles = ['Super Admin', 'Admin', 'Deal Manager', 'Project Manager', 'Employee'];
      const roleFromServer = userData.role_name || 'Employee';
      const finalRole = validRoles.includes(roleFromServer) ? roleFromServer : 'Employee';
      
      login({
        id: userData.id,
        email: userData.email,
        name: userData.first_name,
        role: finalRole,
        avatar: userData.avatar,
      });

      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const DEMO_USERS = [
    { email: 'admin@example.com', password: 'admin123', role: 'Admin' },
    { email: 'owner@example.com', password: 'owner123', role: 'Company Owner' },
    { email: 'deal@example.com', password: 'deal123', role: 'Deal Owner' },
    { email: 'pm@example.com', password: 'pm123', role: 'Project Manager' },
    { email: 'employee@example.com', password: 'employee123', role: 'Employee' },
    { email: 'client@example.com', password: 'client123', role: 'Client' },
    { email: 'lead@example.com', password: 'lead123', role: 'Lead' },
  ];

  const handleDemoLogin = async (demoUser) => {
    setError('');
    setLoading(true);

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: demoUser.email, password: demoUser.password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const userData = await response.json();
      
      const validRoles = ['Super Admin', 'Admin', 'Deal Manager', 'Project Manager', 'Employee'];
      const roleFromServer = userData.role_name || 'Employee';
      const finalRole = validRoles.includes(roleFromServer) ? roleFromServer : 'Employee';
      
      login({
        id: userData.id,
        email: userData.email,
        name: userData.first_name,
        role: finalRole,
        avatar: userData.avatar,
      });

      navigate('/');
    } catch (err) {
      setError(err.message || 'Demo login failed. Please try the regular login form.');
      console.error('Demo login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-lg mb-4">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-bold text-lg">
              D
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Deals Dashboard</h1>
          <p className="text-gray-600">Role-Based Access Control System</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <LogIn size={18} />
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Demo Users */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Demo Accounts</h2>
          <p className="text-sm text-gray-600 mb-4">Click any role to login as that user:</p>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {DEMO_USERS.map((user) => (
              <button
                key={user.email}
                onClick={() => handleDemoLogin(user)}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{user.role}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {user.password}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> This is a demo login system. In production, implement proper JWT authentication with secure password hashing.
            </p>
          </div>

          {/* Signup Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-red-600 font-semibold hover:text-red-700 transition-colors">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
