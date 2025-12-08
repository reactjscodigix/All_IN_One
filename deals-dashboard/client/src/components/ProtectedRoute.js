import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ 
  children, 
  requiredRoles, 
  requiredModules,
  fallback = null 
}) => {
  const { user, hasRole, canAccess } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500">Required role: {Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}</p>
        </div>
      </div>
    );
  }

  if (requiredModules && !canAccess(requiredModules)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this module.</p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
