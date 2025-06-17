import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTER_CONFIG } from '../config';
import { checkTeamAdminAccess } from '../lib/roles';

const ProtectedRoute = ({ requiredRole }) => {
  const [isAuthorized, setIsAuthorized] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (requiredRole === 'team-admin') {
        try {
          const hasAccess = await checkTeamAdminAccess();
          setIsAuthorized(hasAccess);
        } catch (error) {
          console.error('Access check failed:', error);
          setIsAuthorized(false);
        }
      }
      setIsChecking(false);
    };

    checkAccess();
  }, [requiredRole]);

  if (isChecking) {
    return <div>Checking access...</div>;
  }

  return isAuthorized ? <Outlet /> : <Navigate to={ROUTER_CONFIG.ROUTES.SIGNIN} />;
};

export default ProtectedRoute;

















