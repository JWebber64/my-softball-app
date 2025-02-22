import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SupabaseDebug = () => {
  const [status, setStatus] = useState('Checking...');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('player_stats')
          .select('count');

        if (error) throw error;
        
        setStatus(`Connected (${data.length} records found)`);
        console.log('Supabase connection successful:', data);
      } catch (err) {
        setStatus(`Error: ${err.message}`);
        console.error('Supabase connection error:', err);
      }
    };

    checkConnection();
  }, []);

  return (
    <div className="p-4 bg-gray-100 mb-4 rounded">
      <h3 className="font-bold">Supabase Status</h3>
      <p>{status}</p>
    </div>
  );
};

export default SupabaseDebug;