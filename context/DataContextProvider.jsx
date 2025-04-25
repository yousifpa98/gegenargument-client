import React, { createContext, useContext } from 'react';
import { useArguments } from '../hooks/useArguments';

// Create the context
const DataContext = createContext(null);

/**
 * Data context provider component
 * Provides arguments and tags data and methods to the application
 */
export function DataProvider({ children }) {
  const argumentsData = useArguments();
  
  return (
    <DataContext.Provider value={argumentsData}>
      {children}
    </DataContext.Provider>
  );
}

/**
 * Hook to use the data context
 */
export function useData() {
  const context = useContext(DataContext);
  
  if (context === null) {
    throw new Error('useData must be used within a DataProvider');
  }
  
  return context;
}