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
    if (!currentUser) return false;
    
    // Check various possible locations for admin role
    const localCheck = 
      (currentUser.app_metadata?.role === 'team-admin') || 
      (currentUser.app_metadata?.role === 'Team Admin') ||
      (currentUser.app_metadata?.role === 'admin') ||
      (currentUser.role === 'admin') ||
      (currentUser.user_metadata?.role === 'admin');
    
    if (localCheck) return true;
    
    // If not found in user object, check database
    return await checkUserIsAdmin(currentUser.id);
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        console.log('Auth Status:', {
          hasSession: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          loading,
          timestamp: new Date().toISOString()
        });
        
        setSession(session);
        const currentUser = session?.user || null;
        setUser(currentUser);
        
        if (currentUser) {
          const adminStatus = await checkAdminStatus(currentUser);
          setIsAdmin(adminStatus);
          console.log('Admin status check result:', adminStatus);
        }
      } catch (error) {
        console.error('Session fetch error:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state changed:', {
        event: _event,
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        timestamp: new Date().toISOString()
      });
      
      setSession(session);
      const currentUser = session?.user || null;
      setUser(currentUser);
      
      if (currentUser) {
        const adminStatus = await checkAdminStatus(currentUser);
        setIsAdmin(adminStatus);
        console.log('Admin status check result:', adminStatus);
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
      {!loading && children}
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
