import api from './api';

export const getPlayerUrl = async (tmdbId, type, season, episode) => {
  const params = new URLSearchParams({
    media_type: type,
  });

  if (type === 'tv' && season !== undefined && episode !== undefined) {
    params.append('season', season);
    params.append('episode', episode);
  }

  const response = await api.get(`/api/v1/vidsrc/player/${tmdbId}?${params.toString()}`);
  return response.data;
};
