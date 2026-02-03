import api from './api';
import { API_ENDPOINTS } from '../utils/constants';

export const createList = async (name) => {
  const response = await api.post(API_ENDPOINTS.LISTS.CREATE, { name });
  return response.data;
};

export const getUserLists = async () => {
  const response = await api.get(API_ENDPOINTS.LISTS.GET_ALL);
  return response.data;
};

export const getListDetails = async (listId) => {
  const response = await api.get(API_ENDPOINTS.LISTS.DETAILS(listId));
  return response.data;
};

export const deleteList = async (listId) => {
  const response = await api.delete(API_ENDPOINTS.LISTS.DELETE(listId));
  return response.data;
};

export const addItemToList = async (listId, tmdbId, mediaType) => {
  const response = await api.post(API_ENDPOINTS.LISTS.ADD_ITEM(listId), {
    tmdb_id: tmdbId,
    media_type: mediaType,
  });
  return response.data;
};

export const removeItemFromList = async (listId, itemId) => {
  const response = await api.delete(API_ENDPOINTS.LISTS.REMOVE_ITEM(listId, itemId));
  return response.data;
};
