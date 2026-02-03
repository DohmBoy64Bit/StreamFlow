export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  RECOVER: '/recover',
  PROFILE: '/profile',
  MOVIE: '/movie/:id',
  SHOW: '/show/:id',
  WATCH: '/watch/:type/:id',
  LISTS: '/lists',
  LIST_DETAIL: '/lists/:id',
  SEARCH: '/search',
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    RECOVER: '/auth/recover',
    ME: '/auth/me',
  },
  MOVIES: {
    TRENDING: '/movies/trending',
    POPULAR: '/movies/popular',
    TOP_RATED: '/movies/top-rated',
    DETAILS: (id) => `/movies/${id}`,
    SEARCH: '/movies/search',
  },
  TV: {
    TRENDING: '/tv/trending',
    POPULAR: '/tv/popular',
    DETAILS: (id) => `/tv/${id}`,
    SEASON: (id, season) => `/tv/${id}/season/${season}`,
  },
  LISTS: {
    CREATE: '/lists',
    GET_ALL: '/lists',
    DETAILS: (id) => `/lists/${id}`,
    DELETE: (id) => `/lists/${id}`,
    ADD_ITEM: (id) => `/lists/${id}/items`,
    REMOVE_ITEM: (id, itemId) => `/lists/${id}/items/${itemId}`,
  },
  WATCH: {
    HISTORY: '/watch/history',
    RESUME: (id) => `/watch/resume/${id}`,
  },
  STATS: {
    GLOBAL: '/stats/global',
    USER: '/stats/user',
  },
};
