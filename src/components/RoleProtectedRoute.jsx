import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();

  // If no specific roles are defined, allow all authenticated users
  if (!allowedRoles.length) {
    return children;
  }

  // Check if user's role is in the allowed roles
  if (user && allowedRoles.includes(user.role)) {
    return children;
  }

  // Redirect user-admin to users page, others to dashboard
  if (user?.role === 'user-admin') {
    return <Navigate to="/users" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default RoleProtectedRoute;
