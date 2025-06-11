// hooks/useEnvironment.tsx - Enhanced environment hook with auto logout
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

interface UseEnvironmentProps {
  onEnvironmentSwitch?: () => void; // Callback for when environment switches
}

export const useEnvironment = ({
  onEnvironmentSwitch,
}: UseEnvironmentProps = {}) => {
  const [environment, setEnvironment] = useState<EnvironmentState>({
    isProduction: true,
    baseUrl: PRODUCTION_URL,
    environment: 'Production',
  });

  const [isInitialized, setIsInitialized] = useState(false);

  // Function to handle logout when environment switches
  const handleEnvironmentSwitch = () => {
    // Clear auth tokens
    localStorage.removeItem('sentinel_dash_token');
    localStorage.removeItem('sentinel_dash_username');

    // Call the callback function (this will be the handleLogout from App.tsx)
    if (onEnvironmentSwitch) {
      onEnvironmentSwitch();
    }

    console.log('🔐 User logged out due to environment switch');
  };

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

        // Check if environment actually changed (not just a refresh)
        const currentEnv = getCurrentEnvironment();
        const environmentChanged =
          currentEnv.isProduction !== newEnvironment.isProduction;

        // Immediately update API service
        updateEnvironment(newEnvironment);

        // Update React state
        setEnvironment(newEnvironment);

        // Only logout if environment actually switched
        if (environmentChanged && isInitialized) {
          handleEnvironmentSwitch();
        }

        console.log('✅ API and React state updated via hotkey');
      };

      // Set up the listener
      window.electronAPI.onEnvironmentChanged(handleEnvironmentChange);

      return () => {
        window.electronAPI.removeAllListeners('environment-changed');
      };
    }
  }, [isInitialized, onEnvironmentSwitch]);

  const toggleEnvironment = () => {
    if (window.electronAPI) {
      window.electronAPI.toggleEnvironment();
      // Note: The logout will be handled by the environment change listener above
    } else {
      // Direct toggle for web environment
      const currentEnv = getCurrentEnvironment();
      const newEnv = apiToggleEnvironment();
      setEnvironment(newEnv);

      // Check if environment actually changed
      if (currentEnv.isProduction !== newEnv.isProduction) {
        handleEnvironmentSwitch();
      }
    }
  };

  return {
    environment,
    toggleEnvironment,
    isInitialized,
  };
};

// Environment indicator component
export const EnvironmentIndicator = ({
  onEnvironmentSwitch,
}: {
  onEnvironmentSwitch?: () => void;
}) => {
  const { environment, toggleEnvironment, isInitialized } = useEnvironment({
    onEnvironmentSwitch,
  });

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
    //   title={`Click to toggle environment. Current: ${environment.environment} (${environment.baseUrl}). Note: Will log you out.`}
    // >
    //   {environment.environment}
    // </div>
    <></>
  );
};
