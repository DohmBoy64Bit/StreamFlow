import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const registerUser = async (username, password) => {
  const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, {
    username,
    password,
  });
  return response.data;
};

export const loginUser = async (username, password) => {
  const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, {
    username,
    password,
  });
  return response.data;
};

export const recoverPassword = async (username, code, newPassword) => {
  const response = await api.post(API_ENDPOINTS.AUTH.RECOVER, {
    username,
    recovery_code: code,
    new_password: newPassword,
  });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get(API_ENDPOINTS.AUTH.ME);
  return response.data;
};
