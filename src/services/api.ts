import axios from 'axios';
import { baseURL } from '../../constants';

const authToken =  localStorage.getItem('sentinel_dash_token');

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Authorization': `Bearer ${authToken}`,
  },
});

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
