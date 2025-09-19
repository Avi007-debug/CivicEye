import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password, role = 'citizen') => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      id: '1',
      name: role === 'government' ? 'Officer Smith' : 'John Doe',
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`
    };
    
    setUser(mockUser);
    setIsLoading(false);
  };

  const register = async (name, email, password, role = 'citizen') => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      id: Date.now().toString(),
      name,
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`
    };
    
    setUser(mockUser);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};