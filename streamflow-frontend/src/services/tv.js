import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getTrendingTV = async (page = 1) => {
  const response = await api.get(API_ENDPOINTS.TV.TRENDING, {
    params: { page },
  });
  return response.data;
};

export const getPopularTV = async (page = 1) => {
  const response = await api.get(API_ENDPOINTS.TV.POPULAR, {
    params: { page },
  });
  return response.data;
};

export const getTVDetails = async (tmdbId) => {
  const response = await api.get(API_ENDPOINTS.TV.DETAILS(tmdbId));
  return response.data;
};

export const getSeasonDetails = async (tmdbId, seasonNumber) => {
  const response = await api.get(API_ENDPOINTS.TV.SEASON(tmdbId, seasonNumber));
  return response.data;
};

export const searchTV = async (query, filters = {}, page = 1) => {
  const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});
  
  const response = await api.get('/api/v1/tv/search', {
    params: { query, page, ...cleanFilters },
  });
  return response.data;
};
