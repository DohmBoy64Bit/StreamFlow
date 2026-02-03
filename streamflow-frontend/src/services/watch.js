import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const saveWatchPosition = async (tmdbId, mediaType, season, episode, position) => {
  const response = await api.post(API_ENDPOINTS.WATCH.HISTORY, {
    tmdb_id: tmdbId,
    media_type: mediaType,
    season_number: season,
    episode_number: episode,
    last_position: position,
  });
  return response.data;
};

export const getResumePosition = async (tmdbId, mediaType, season, episode) => {
  const params = { media_type: mediaType };
  if (season) params.season = season;
  if (episode) params.episode = episode;

  const response = await api.get(API_ENDPOINTS.WATCH.RESUME(tmdbId), { params });
  return response.data;
};

export const getWatchHistory = async (limit = 20, offset = 0) => {
  const response = await api.get(API_ENDPOINTS.WATCH.HISTORY, {
    params: { limit, offset },
  });
  return response.data;
};
