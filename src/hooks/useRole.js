import { useEffect, useState } from 'react';
import { roleService } from '../services/roleService';
import { useAuth } from './useAuth';

export const useRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRole = async () => {
      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      try {
        // Use the roleService which uses the secure RPC function
        const userRole = await roleService.getUserRole(user.id);
        setRole(userRole);
        setError(null);
      } catch (error) {
        console.error('Error loading role:', error);
        setError(error);
        setRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadRole();
  }, [user]);

  return { role, isLoading, error };
};

