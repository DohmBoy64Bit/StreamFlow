import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getGlobalStats = async () => {
  const response = await api.get(API_ENDPOINTS.STATS.GLOBAL);
  return response.data;
};

export const getUserStats = async () => {
  const response = await api.get(API_ENDPOINTS.STATS.USER);
  return response.data;
};
