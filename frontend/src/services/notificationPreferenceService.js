import { api } from '../context/AuthContext';

export const getPreferences = async () => {
  try {
    const response = await api.get('/api/notifications/preferences');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch preferences');
  }
};

export const updatePreferences = async (data) => {
  try {
    const response = await api.put('/api/notifications/preferences', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update preferences');
  }
};
