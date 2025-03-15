import { apiRequest } from '../apiClient';

/**
 * Get system statistics for the admin dashboard
 * @returns {Promise<Object>} Statistics data
 */
export const getAdminStats = async () => {
  try {
    const response = await apiRequest({
      url: '/api/admin/stats',
      method: 'GET',
    });
    
    return {
      success: true,
      ...response.data,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch admin statistics',
    };
  }
};

/**
 * Get recent activity for the admin dashboard
 * @param {number} limit - Number of activities to return
 * @returns {Promise<Object>} Recent activity data
 */
export const getRecentActivity = async (limit = 10) => {
  try {
    const response = await apiRequest({
      url: '/api/admin/activity',
      method: 'GET',
      params: { limit },
    });
    
    return {
      success: true,
      activities: response.data.activities || [],
    };
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch recent activity',
      activities: [],
    };
  }
};

/**
 * Get system settings
 * @returns {Promise<Object>} System settings
 */
export const getSystemSettings = async () => {
  try {
    const response = await apiRequest({
      url: '/api/admin/settings',
      method: 'GET',
    });
    
    return {
      success: true,
      settings: response.data.settings || {},
    };
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch system settings',
      settings: {},
    };
  }
};

/**
 * Update system settings
 * @param {Object} settings - Settings to update
 * @returns {Promise<Object>} Updated settings
 */
export const updateSystemSettings = async (settings) => {
  try {
    const response = await apiRequest({
      url: '/api/admin/settings',
      method: 'PUT',
      data: { settings },
    });
    
    return {
      success: true,
      settings: response.data.settings || {},
    };
  } catch (error) {
    console.error('Error updating system settings:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update system settings',
    };
  }
};

/**
 * Get user activity logs
 * @param {Object} filters - Filters for the logs
 * @returns {Promise<Object>} User activity logs
 */
export const getUserActivityLogs = async (filters = {}) => {
  try {
    const response = await apiRequest({
      url: '/api/admin/logs',
      method: 'GET',
      params: filters,
    });
    
    return {
      success: true,
      logs: response.data.logs || [],
      total: response.data.total || 0,
    };
  } catch (error) {
    console.error('Error fetching user activity logs:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch user activity logs',
      logs: [],
      total: 0,
    };
  }
};

/**
 * Get system health status
 * @returns {Promise<Object>} System health status
 */
export const getSystemHealth = async () => {
  try {
    const response = await apiRequest({
      url: '/api/admin/health',
      method: 'GET',
    });
    
    return {
      success: true,
      health: response.data.health || {},
    };
  } catch (error) {
    console.error('Error fetching system health:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch system health',
      health: {},
    };
  }
}; 