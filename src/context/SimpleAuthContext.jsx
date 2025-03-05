import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ROUTER_CONFIG } from '../constants/routing';

export const SimpleAuthContext = createContext();

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  return context;
}

export function SimpleAuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allTeams, setAllTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [noTeamsAvailable, setNoTeamsAvailable] = useState(false);
  const navigate = useNavigate();

  const clearAuth = () => {
    setSession(null);
    setUser(null);
    setIsAuthenticated(false);
    setAllTeams([]);
    setActiveTeam(null);
    localStorage.clear(); // Clear all localStorage
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      clearAuth();
      
      // Remove any remaining auth-related items
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('activeTeamId');
      localStorage.removeItem('bypassRedirect');
      
      // Clear any session cookies
      document.cookie.split(";").forEach(cookie => {
        document.cookie = cookie
          .replace(/^ +/, "")
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
      });

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const setCurrentTeam = async (teamId) => {
    try {
      if (!teamId) {
        setActiveTeam(null);
        localStorage.removeItem('activeTeamId');
        return null;
      }

      // Fetch full team details including logo
      const { data: teamData, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;

      setActiveTeam(teamData);
      localStorage.setItem('activeTeamId', teamId);
      return teamData;
    } catch (error) {
      console.error('Error setting current team:', error);
      throw error;
    }
  };

  const fetchTeamInfo = async (userId) => {
    try {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('admin_id', userId);

      if (error) throw error;

      setAllTeams(data || []);

      if (data && data.length > 0) {
        const savedTeamId = localStorage.getItem('activeTeamId');
        if (savedTeamId && data.some(team => team.id === savedTeamId)) {
          await setCurrentTeam(savedTeamId);
        } else {
          await setCurrentTeam(data[0].id);
        }
      } else {
        setActiveTeam(null);
        localStorage.removeItem('activeTeamId');
      }

      return data;
    } catch (error) {
      console.error('Error in fetchTeamInfo:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        
        if (session?.user) {
          await fetchTeamInfo(session.user.id);
        } else {
          // Clear team state if not authenticated
          setAllTeams([]);
          setActiveTeam(null);
          localStorage.removeItem('activeTeamId');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value = {
    isAuthenticated,
    user,
    session,
    loading,
    activeTeam,
    allTeams,
    noTeamsAvailable,
    setCurrentTeam,
    signOut,
    clearAuth,
    fetchTeamInfo
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}
