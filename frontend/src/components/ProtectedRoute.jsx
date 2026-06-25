import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { isAuthenticated, role, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="container flex align-center justify-between" style={{ minHeight: '50vh', justifyContent: 'center' }}>
        <h2>Loading Access Verification...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // If user's role is not matching, redirect them to their respective dashboard
    const redirectPath = role === 'jobseeker' ? '/jobseeker/dashboard' : '/employer/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
