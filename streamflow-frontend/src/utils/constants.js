export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    RECOVER: '/api/v1/auth/recover-password',
    ME: '/api/v1/auth/me',
  },
  MOVIES: {
    TRENDING: '/api/v1/movies/trending',
    POPULAR: '/api/v1/movies/popular',
    TOP_RATED: '/api/v1/movies/top-rated',
    DETAILS: (id) => `/api/v1/movies/${id}`,
    SEARCH: '/api/v1/movies/search',
  },
  TV: {
    TRENDING: '/api/v1/tv/trending',
    POPULAR: '/api/v1/tv/popular',
    DETAILS: (id) => `/api/v1/tv/${id}`,
    SEASON: (id, season) => `/api/v1/tv/${id}/season/${season}`,
  },
  LISTS: {
    CREATE: '/api/v1/lists',
    GET_ALL: '/api/v1/lists',
    DETAILS: (id) => `/api/v1/lists/${id}`,
    DELETE: (id) => `/api/v1/lists/${id}`,
    ADD_ITEM: (id) => `/api/v1/lists/${id}/items`,
    REMOVE_ITEM: (id, itemId) => `/api/v1/lists/${id}/items/${itemId}`,
  },
  WATCH: {
    HISTORY: '/api/v1/watch/history',
    RESUME: (id) => `/api/v1/watch/resume/${id}`,
  },
  STATS: {
    GLOBAL: '/api/v1/stats/global',
    USER: '/api/v1/stats/user',
  },
};
