import api from './api';

export const getPlayerUrl = async (tmdbId, type, season, episode) => {
  const params = new URLSearchParams({
    type: type,
  });

  if (type === 'tv' && season !== undefined && episode !== undefined) {
    params.append('season', season);
    params.append('episode', episode);
  }

  const response = await api.get(`/vidsrc/player/${tmdbId}?${params.toString()}`);
  return response.data;
};
