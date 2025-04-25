import React from 'react';
import { AuthProvider } from './AuthContextProvider';
import { DataProvider } from './DataContextProvider';

/**
 * Combined provider component that wraps all context providers
 * This creates a clean way to provide all application state
 */
export function AppProvider({ children }) {
  return (
    <AuthProvider>
      <DataProvider>
        {children}
      </DataProvider>
    </AuthProvider>
  );
}

export default AppProvider;