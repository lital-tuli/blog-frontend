import jwt_decode from 'jwt-decode';

/**
 * Check if a JWT token is expired
 * @param {string} token - JWT token to check
 * @param {number} bufferTime - Buffer time in seconds before actual expiration
 * @returns {boolean} True if token is expired or about to expire
 */
export const isTokenExpired = (token, bufferTime = 60) => {
  if (!token) return true;
  
  try {
    const decoded = jwt_decode(token);
    const currentTime = Date.now() / 1000;
    
    // Check if token will expire within the buffer time
    return decoded.exp < currentTime + bufferTime;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

/**
 * Get user information from token
 * @param {string} token - JWT token
 * @returns {Object|null} User information from token or null if invalid
 */
export const getUserFromToken = (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwt_decode(token);
    return {
      id: decoded.user_id,
      username: decoded.username,
      email: decoded.email,
      isStaff: decoded.is_staff,
      groups: decoded.groups || []
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Save auth tokens to localStorage
 * @param {Object} tokens - Object containing access and refresh tokens
 * @param {Object} userData - User data to save
 */
export const saveAuthTokens = (tokens, userData) => {
  localStorage.setItem('access_token', tokens.access);
  localStorage.setItem('refresh_token', tokens.refresh);
  localStorage.setItem('user', JSON.stringify(userData));
};

/**
 * Clear auth tokens from localStorage
 */
export const clearAuthTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

/**
 * Get stored auth data
 * @returns {Object} Object containing tokens and user data
 */
export const getStoredAuthData = () => {
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  return {
    accessToken,
    refreshToken,
    user,
    isAuthenticated: !!accessToken && !!user
  };
};

/**
 * Check if user has specific permission
 * @param {Object} user - User object
 * @param {string} permission - Permission to check (e.g., 'article.add_article')
 * @returns {boolean} True if user has permission
 */
export const hasPermission = (user, permission) => {
  if (!user) return false;
  
  // Admin/staff has all permissions
  if (user.is_staff) return true;
  
  // Check if user has the specific permission
  return user.permissions && user.permissions.includes(permission);
};

/**
 * Check if user belongs to a specific group
 * @param {Object} user - User object
 * @param {string|string[]} groups - Group or array of groups to check
 * @returns {boolean} True if user belongs to any of the groups
 */
export const isInGroup = (user, groups) => {
  if (!user || !user.groups) return false;
  
  const groupsToCheck = Array.isArray(groups) ? groups : [groups];
  
  // Check if user groups is an array
  if (Array.isArray(user.groups)) {
    return user.groups.some(group => groupsToCheck.includes(group));
  }
  
  // If user.groups is a string (single group)
  return groupsToCheck.includes(user.groups);
};

/**
 * Check if user can perform a specific action
 * Combines permission and group checks
 * @param {Object} user - User object
 * @param {string} action - Action to check ('create', 'update', 'delete')
 * @param {string} resource - Resource to check (e.g., 'article', 'comment')
 * @returns {boolean} True if user can perform the action
 */
export const canPerformAction = (user, action, resource) => {
  if (!user) return false;
  
  // Admin/staff can do anything
  if (user.is_staff) return true;
  
  // Map action to permission name suffix
  const permissionMap = {
    create: 'add',
    read: 'view',
    update: 'change',
    delete: 'delete'
  };
  
  const permissionSuffix = permissionMap[action] || action;
  const permission = `${resource}.${permissionSuffix}_${resource}`;
  
  // Check permissions first
  if (hasPermission(user, permission)) return true;
  
  // Then check groups based on resource and action
  if (resource === 'article') {
    if (['create', 'update'].includes(action)) {
      return isInGroup(user, ['editors', 'management']);
    }
    if (action === 'delete') {
      return isInGroup(user, 'management');
    }
  }
  
  if (resource === 'comment') {
    if (action === 'create') {
      return true; // Any authenticated user can create comments
    }
    if (action === 'delete') {
      return isInGroup(user, 'management');
    }
  }
  
  return false;
};