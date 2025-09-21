import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const SupabaseTest = () => {
  const [status, setStatus] = useState('Testing...');
  const [error, setError] = useState(null);

  useEffect(() => {
    const testSupabase = async () => {
      try {
        // Get environment variables
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
          setError('Missing Supabase environment variables');
          setStatus('Failed');
          return;
        }

        console.log('Supabase URL:', supabaseUrl);
        console.log('Supabase Key:', supabaseKey.substring(0, 20) + '...');

        // Initialize Supabase client
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Test basic connection
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setError(`Supabase connection error: ${error.message}`);
          setStatus('Failed');
        } else {
          setStatus('Connected successfully');
          setError(null);
        }
      } catch (err) {
        setError(`Test error: ${err.message}`);
        setStatus('Failed');
      }
    };

    testSupabase();
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Supabase Connection Test</h3>
      <div className={`p-2 rounded ${status === 'Connected successfully' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        <strong>Status:</strong> {status}
      </div>
      {error && (
        <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default SupabaseTest;
