import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { supabase, checkUserIsAdmin } from '../lib/supabaseClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = async (currentUser) => {
    if (!currentUser) {
      setIsAdmin(false);
      return false;
    }
    
    // Log the current user's metadata for debugging
    console.log('Checking admin status for user:', {
      id: currentUser.id,
      app_metadata: currentUser.app_metadata,
      user_metadata: currentUser.user_metadata,
      role: currentUser.role
    });

    // Check various possible locations for admin role
    const localCheck = 
      (currentUser.app_metadata?.role === 'team-admin') || 
      (currentUser.app_metadata?.role === 'Team Admin') ||
      (currentUser.app_metadata?.role === 'admin') ||
      (currentUser.role === 'admin') ||
      (currentUser.user_metadata?.role === 'admin');
    
    if (localCheck) {
      console.log('User has admin role in metadata');
      return true;
    }
    
    // If not found in user object, check database
    const isDbAdmin = await checkUserIsAdmin(currentUser.id);
    console.log('Database admin check result:', isDbAdmin);
    return isDbAdmin;
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          const adminStatus = await checkAdminStatus(currentUser);
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Session fetch error:', error.message);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        const adminStatus = await checkAdminStatus(currentUser);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Add the useAuth hook here
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthProvider;
