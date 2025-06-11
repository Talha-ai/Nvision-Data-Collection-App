// hooks/useEnvironment.tsx - Simplified environment hook
import { useEffect, useState } from 'react';
import {
  getCurrentEnvironment,
  initializeAPI,
  toggleEnvironment as apiToggleEnvironment,
  updateEnvironment,
} from '../services/api';
import { PRODUCTION_URL } from '../../constants';

interface EnvironmentState {
  isProduction: boolean;
  baseUrl: string;
  environment: string;
}

export const useEnvironment = () => {
  const [environment, setEnvironment] = useState<EnvironmentState>({
    isProduction: true,
    baseUrl: PRODUCTION_URL,
    environment: 'Production',
  });

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initEnvironment = async () => {
      await initializeAPI();
      const currentEnv = getCurrentEnvironment();
      setEnvironment(currentEnv);
      setIsInitialized(true);
    };

    initEnvironment();

    // Listen for environment changes from Electron
    if (window.electronAPI) {
      const handleEnvironmentChange = (
        _event: any,
        newEnvironment: EnvironmentState
      ) => {
        console.log(
          '🔄 Environment changed from Electron (hotkey):',
          newEnvironment
        );

        // Immediately update API service
        updateEnvironment(newEnvironment);

        // Update React state
        setEnvironment(newEnvironment);

        console.log('✅ API and React state updated via hotkey');
      };

      // Set up the listener
      window.electronAPI.onEnvironmentChanged(handleEnvironmentChange);

      return () => {
        window.electronAPI.removeAllListeners('environment-changed');
      };
    }
  }, []);

  const toggleEnvironment = () => {
    if (window.electronAPI) {
      window.electronAPI.toggleEnvironment();
    } else {
      // Direct toggle for web environment
      const newEnv = apiToggleEnvironment();
      setEnvironment(newEnv);
    }
  };

  return {
    environment,
    toggleEnvironment,
    isInitialized,
  };
};

// Environment indicator component
export const EnvironmentIndicator = () => {
  const { environment, toggleEnvironment, isInitialized } = useEnvironment();

  if (!isInitialized) {
    return (
      <div className="fixed top-4 right-4 px-3 py-1 rounded-full text-sm font-medium z-50 bg-gray-500 text-white">
        Loading...
      </div>
    );
  }

  return (
    // <div
    //   className={`fixed top-4 right-4 px-3 py-1 rounded-full text-sm font-medium z-50 cursor-pointer transition-colors ${
    //     environment.isProduction
    //       ? 'bg-red-500 text-white hover:bg-red-600'
    //       : 'bg-yellow-500 text-black hover:bg-yellow-600'
    //   }`}
    //   onClick={toggleEnvironment}
    //   title={`Click to toggle environment. Current: ${environment.environment} (${environment.baseUrl})`}
    // >
    //   {environment.environment}
    // </div>
    <div></div>
  );
};
