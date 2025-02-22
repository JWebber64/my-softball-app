import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthDebugger = () => {
  const [status, setStatus] = useState('Checking connection...');

  useEffect(() => {
    async function checkConnection() {
      try {
        // Test the connection
        const { data, error } = await supabase.from('player_stats').select('count');
        
        if (error) {
          throw error;
        }

        // Log connection details
        console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
        console.log('Connection successful');
        console.log('Data:', data);
        
        setStatus('Connected to Supabase successfully');
      } catch (error) {
        console.error('Connection error:', error);
        setStatus(`Error: ${error.message}`);
      }
    }

    checkConnection();
  }, []);

  return (
    <div className="p-4 m-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Status</h2>
      <p>{status}</p>
    </div>
  );
};

export default AuthDebugger;
