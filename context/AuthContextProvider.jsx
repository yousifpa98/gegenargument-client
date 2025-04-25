import React, { createContext, useContext } from 'react';
import { useUser } from '../hooks/useUser';

// Create the context
const AuthContext = createContext(null);

/**
 * Auth context provider component
 * Provides authentication state and methods to the application
 */
export function AuthProvider({ children }) {
  const auth = useUser();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use the auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}