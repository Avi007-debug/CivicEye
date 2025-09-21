import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      // Check for existing tokens in localStorage
      const accessToken = localStorage.getItem('access_token');

      if (accessToken) {
        try {
          // Fetch user profile using the stored token
          const profileResponse = await fetch('http://localhost:5000/api/auth/profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });

          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setUser({
              ...profileData.user,
              name: profileData.user.full_name,
              avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.user.full_name)}&background=3B82F6&color=fff&size=128`,
              role: profileData.user.user_type
            });
            setSession({
              access_token: accessToken,
              refresh_token: localStorage.getItem('refresh_token')
            });
          } else if (profileResponse.status === 404) {
            // Profile not found, likely user not logged in yet, silently ignore
          } else {
            // Token is invalid or other error, clear localStorage
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        } catch (error) {
          // Log unexpected errors but do not clear tokens to avoid disrupting other functions
          console.error('Error initializing auth:', error);
        }
      }

      setIsLoading(false);
    };

    initializeAuth();

    // Listen for auth changes (for logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password, role = 'citizen') => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Login failed');

      // Save tokens
      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('refresh_token', result.refresh_token);

      // Set user state
      setUser({
        ...result.user,
        name: result.user.full_name,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.full_name)}&background=3B82F6&color=fff&size=128`,
        role: result.user.user_type
      });

      // Set session state with tokens
      setSession({
        access_token: result.access_token,
        refresh_token: result.refresh_token
      });

      setIsLoading(false);
      return { user: { ...result.user, role: result.user.user_type } };
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const register = async (fullName, email, password, userType = 'citizen', phone = '', address = '') => {
    setIsLoading(true);
    try {
      // Call backend API instead of direct Supabase Auth
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          password: password,
          full_name: fullName,
          user_type: userType,
          phone: phone,
          address: address
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }

      // Save tokens
      localStorage.setItem('access_token', result.access_token);
      localStorage.setItem('refresh_token', result.refresh_token);

      // Set user state
      setUser({
        ...result.user,
        name: result.user.full_name, // Add name property for Navbar
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.full_name)}&background=3B82F6&color=fff&size=128`, // Generate avatar
        role: result.user.user_type // Add role property for Navbar
      });

      setIsLoading(false);
      return {
        user: {
          ...result.user,
          name: result.user.full_name, // Add name property for Navbar
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(result.user.full_name)}&background=3B82F6&color=fff&size=128`, // Generate avatar
          role: result.user.user_type // Add role property for Navbar
        },
        session: {
          access_token: result.access_token,
          refresh_token: result.refresh_token
        }
      };
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      // Clear tokens from localStorage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    login,
    register,
    logout,
    isLoading,
    supabase // Expose supabase client for other components
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
