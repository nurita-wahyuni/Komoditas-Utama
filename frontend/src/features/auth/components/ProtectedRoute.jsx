import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from "../../../context/AuthContext";
import PropTypes from 'prop-types';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Role mismatch: redirect based on actual role
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (user.role === 'OPERATOR') return <Navigate to="/" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string)
};

export default ProtectedRoute;
