import axios from 'axios';
import { baseURL } from '../../constants';

const getAuthToken = () => localStorage.getItem('sentinel_dash_token');

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token in every request
api.interceptors.request.use(
  (config) => {
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
    const response = await api.post('/data/display-panel/check_display_panel/', {
      ppid,
    });
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
