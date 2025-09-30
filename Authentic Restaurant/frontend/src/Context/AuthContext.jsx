import React, { createContext, useState, useEffect } from 'react';
import { dummyUsers } from '../data/dummyUsers';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Simulate loading user from local storage or API
    const loadUser = async () => {
      try {
        // Check if we have a token
        const token = localStorage.getItem('token');
        
        if (token) {
          setCurrentUser(dummyUsers[0]);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
        setError('Failed to authenticate user. Please log in again.');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
     
      const user = dummyUsers.find(u => u.email === email);
      if (user && password === 'password') { 
        localStorage.setItem('token', 'demo-token');
        setCurrentUser(user);
        return { success: true };
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
    
      const newUser = {
        id: dummyUsers.length + 1,
        ...userData,
        avatar: '/assets/images/default-avatar.png',
        followers: 0,
        following: 0,
        skills: []
      };
      
      localStorage.setItem('token', 'demo-token');
      setCurrentUser(newUser);
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to register');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
   
    localStorage.removeItem('token');
    setCurrentUser(null);
  };
  
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      setError(null);
     
      setCurrentUser(prev => ({
        ...prev,
        ...updates
      }));
      
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    currentUser,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated: !!currentUser
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
