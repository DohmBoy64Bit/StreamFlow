import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const getTrendingMovies = async (page = 1) => {
  const response = await api.get(API_ENDPOINTS.MOVIES.TRENDING, {
    params: { page },
  });
  return response.data;
};

export const getPopularMovies = async (page = 1) => {
  const response = await api.get(API_ENDPOINTS.MOVIES.POPULAR, {
    params: { page },
  });
  return response.data;
};

export const getTopRatedMovies = async (page = 1) => {
  const response = await api.get(API_ENDPOINTS.MOVIES.TOP_RATED, {
    params: { page },
  });
  return response.data;
};

export const getMovieDetails = async (tmdbId) => {
  const response = await api.get(API_ENDPOINTS.MOVIES.DETAILS(tmdbId));
  return response.data;
};

export const searchMovies = async (query, filters = {}, page = 1) => {
  const response = await api.get(API_ENDPOINTS.MOVIES.SEARCH, {
    params: { query, page, ...filters },
  });
  return response.data;
};
