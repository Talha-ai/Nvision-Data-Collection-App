import axios from 'axios';
import { STAGING_URL, PRODUCTION_URL } from '../../constants';

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Logout callback function that will be set from App.tsx
let logoutCallback: (() => void) | null = null;

let currentEnvironment = {
  isProduction: true,
  baseUrl: PRODUCTION_URL,
  environment: 'Production',
};

const getAuthToken = () => localStorage.getItem('sentinel_dash_token');
const getRefreshToken = () => localStorage.getItem('sentinel_dash_refresh');

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
};

// Function to set logout callback from App.tsx
export const setLogoutCallback = (callback: () => void) => {
  logoutCallback = callback;
};

// Internal logout function
const performLogout = () => {
  localStorage.removeItem('sentinel_dash_token');
  localStorage.removeItem('sentinel_dash_username');
  localStorage.removeItem('sentinel_dash_refresh');
  if (logoutCallback) {
    logoutCallback();
  }
};

export const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor that always uses current environment
api.interceptors.request.use(
  (config) => {
    config.baseURL = currentEnvironment.baseUrl;

    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check for expired access token
    if (
      error.response?.data?.code === 'token_not_valid' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshToken = getRefreshToken();
          const response = await axios.post(
            `${currentEnvironment.baseUrl}/login/refresh/`,
            {
              refresh: refreshToken,
            }
          );

          const { access, refresh } = response.data;

          // Save new tokens
          localStorage.setItem('sentinel_dash_token', access);
          localStorage.setItem('sentinel_dash_refresh', refresh);

          onRefreshed(access);
          isRefreshing = false;

          return api(originalRequest); // Retry original request
        } catch (refreshError) {
          console.error('Refresh token failed:', refreshError);
          isRefreshing = false;

          // Check if refresh also failed with token_not_valid
          if (refreshError.response?.data?.code === 'token_not_valid') {
            console.log('Refresh token is also invalid, logging out user');
            performLogout();
          } else {
            // For other refresh errors, still clear tokens but don't trigger full logout
            localStorage.removeItem('sentinel_dash_token');
            localStorage.removeItem('sentinel_dash_refresh');
          }

          return Promise.reject(refreshError);
        }
      }

      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

// Function to update environment state
export const updateEnvironment = (newEnvironment) => {
  currentEnvironment = { ...newEnvironment };
};

// Function to toggle environment (for web use)
export const toggleEnvironment = () => {
  currentEnvironment.isProduction = !currentEnvironment.isProduction;
  currentEnvironment.baseUrl = currentEnvironment.isProduction
    ? PRODUCTION_URL
    : STAGING_URL;
  currentEnvironment.environment = currentEnvironment.isProduction
    ? 'Production'
    : 'Staging';

  console.log('Environment toggled:', currentEnvironment);
  return { ...currentEnvironment };
};

// Function to get current environment state
export const getCurrentEnvironment = () => ({ ...currentEnvironment });

// Initialize API
export const initializeAPI = async () => {
  if (window.electronAPI) {
    try {
      const electronEnv = await window.electronAPI.getCurrentEnvironment();
      updateEnvironment(electronEnv);
      console.log('API initialized from Electron:', currentEnvironment);
    } catch (error) {
      console.error('Failed to get environment from Electron:', error);
    }
  } else {
    // Web fallback
    const envUrl = import.meta.env.VITE_BASE_URL;
    if (envUrl && envUrl.includes('staging')) {
      updateEnvironment({
        isProduction: false,
        baseUrl: STAGING_URL,
        environment: 'Staging',
      });
    }
  }
};
// Authentication
export const login = async (username: string, password: string) => {
  try {
    const response = await api.post('/login/', {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Display Panel
export const checkDisplayPanel = async (ppid: string) => {
  try {
    const response = await api.post(
      '/data/display-panel/check_display_panel/',
      {
        ppid,
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error checking display panel:', error);
    throw error;
  }
};

export const createDisplayPanel = async (data: {
  ppid: string;
  defects?: number[];
  panel_images: Array<{
    panel: string;
    image_url: string;
    base_pattern: number;
  }>;
  test_type: 'test' | 'production';
  inference?: boolean;
}) => {
  try {
    const response = await api.post('/data/display-panel/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating display panel:', error);
    throw error;
  }
};

export const getTaskStatus = async (taskUuid: string) => {
  try {
    const response = await api.get(`/data/task/${taskUuid}/status/`);
    return response.data;
  } catch (error) {
    console.error('Error getting task status:', error);
    throw error;
  }
};

// Defect Management
export const getDefects = async () => {
  try {
    const response = await api.get('/data/defect/');
    return response.data;
  } catch (error) {
    console.error('Error fetching defects:', error);
    throw error;
  }
};

// Statistics
export const getPanelStats = async () => {
  try {
    const response = await api.get('/data/panel-image-search/stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching panel statistics:', error);
    throw error;
  }
};

// Inference Usage
export const getInferenceUsage = async () => {
  try {
    const response = await api.get('/data/inference-usage/my-usage/');
    return response.data;
  } catch (error) {
    console.error('Error fetching inference usage:', error);
    throw error;
  }
};

export const getGroupInferenceUsage = async () => {
  try {
    const response = await api.get('/data/inference-usage/group-usage/');
    return response.data;
  } catch (error) {
    console.error('Error fetching group inference usage:', error);
    throw error;
  }
};
