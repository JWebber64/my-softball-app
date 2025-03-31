import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ROUTER_CONFIG } from '../config';
import { checkTeamAdminAccess } from '../lib/roles';

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (requiredRole === 'team-admin') {
        const hasAccess = await checkTeamAdminAccess();
        console.log('Team admin role check:', hasAccess);
        setIsAuthorized(hasAccess);
      }
      // Add other role checks as needed
    };

    checkAccess();
  }, [requiredRole]);

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to={ROUTER_CONFIG.ROUTES.SIGNIN} />;
};

export default ProtectedRoute;















