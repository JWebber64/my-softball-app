// AuthContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "../lib/supabaseClient"; // Updated import path

// Create the AuthContext to provide authentication data globally
const AuthContext = createContext();

// AuthProvider: Manages user session and provides context
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Fetch session data on first render
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error.message);
        return;
      }
      setSession(data.session);
      setUser(data.session?.user || null);
    };

    fetchSession();

    // Listen for authentication state changes (sign-in, sign-out)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });

    // Clean up listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, session }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

export default AuthProvider;
