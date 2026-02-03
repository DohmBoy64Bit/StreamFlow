import api from './api';

export const saveWatchPosition = async (tmdbId, mediaType, season, episode, position) => {
  const payload = {
    tmdb_id: tmdbId,
    media_type: mediaType,
    last_position: position,
  };

  if (mediaType === 'tv' && season !== undefined && episode !== undefined) {
    payload.season_number = season;
    payload.episode_number = episode;
  }

  const response = await api.post('/watch/history', payload);
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

  const response = await api.get(`/watch/resume/${tmdbId}?${params.toString()}`);
  return response.data;
};

export const getWatchHistory = async (limit = 20, offset = 0) => {
  const response = await api.get(`/watch/history?limit=${limit}&offset=${offset}`);
  return response.data;
};
