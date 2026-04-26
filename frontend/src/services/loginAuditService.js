import { api } from '../context/AuthContext';

export const getLoginActivity = async () => {
  try {
    const response = await api.get('/api/admin/security/login-activity');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch login activity:', error);
    // Mock data fallback just in case
    return [];
  }
};

export const getSecurityStats = async () => {
  try {
    const response = await api.get('/api/admin/security/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch security stats:', error);
    // Mock data fallback
    return {
      totalLogins: 0,
      successLogins: 0,
      failedAttempts: 0
    };
  }
};
