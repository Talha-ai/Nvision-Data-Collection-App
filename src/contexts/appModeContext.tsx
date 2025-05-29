import React, { createContext, useContext, useState, useEffect } from 'react';

interface AppModeContextType {
  isTestMode: boolean;
  setIsTestMode: (mode: boolean) => void;
}

const AppModeContext = createContext<AppModeContextType | undefined>(undefined);

export const AppModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isTestMode, setIsTestMode] = useState(() => {
    const saved = localStorage.getItem('appMode');
    return saved ? saved === 'test' : false;
  });

  useEffect(() => {
    localStorage.setItem('appMode', isTestMode ? 'test' : 'production');
  }, [isTestMode]);

  return (
    <AppModeContext.Provider value={{ isTestMode, setIsTestMode }}>
      {children}
    </AppModeContext.Provider>
  );
};

export const useAppMode = () => {
  const context = useContext(AppModeContext);
  if (!context) throw new Error('useAppMode must be used within AppModeProvider');
  return context;
}; 