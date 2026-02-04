import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const saveWatchPosition = async (tmdbId, mediaType, season, episode, position) => {
  const payload = {
    tmdb_id: tmdbId,
    media_type: mediaType,
    position: position,
  };

  if (mediaType === 'tv' && season !== undefined && episode !== undefined) {
    payload.season_number = season;
    payload.episode_number = episode;
  }

  const response = await api.post(API_ENDPOINTS.WATCH.HISTORY, payload);
  return response.data;
};

export const getResumePosition = async (tmdbId, mediaType, season, episode) => {
  const params = new URLSearchParams({
    media_type: mediaType,
  });

  if (mediaType === 'tv' && season !== undefined && episode !== undefined) {
    params.append('season', season);
    params.append('episode', episode);
  }

  const response = await api.get(`${API_ENDPOINTS.WATCH.RESUME(tmdbId)}?${params.toString()}`);
  return response.data;
};

export const getWatchHistory = async (limit = 20, offset = 0) => {
  const response = await api.get(`${API_ENDPOINTS.WATCH.HISTORY}?limit=${limit}&offset=${offset}`);
  return response.data;
};
