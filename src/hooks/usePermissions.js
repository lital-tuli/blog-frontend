import { useSelector } from 'react-redux';

/**
 * Custom hook for checking user permissions
 * 
 * @returns {Object} Object with permission check methods
 */
const usePermissions = () => {
  const { user } = useSelector(state => state.auth);

  /**
   * Check if the user has admin permissions
   * 
   * @returns {boolean} True if user is an admin
   */
  const isAdmin = () => {
    if (!user) return false;
    
    // Check if user is staff or belongs to management group
    return user.is_staff || 
           (user.groups && 
            (Array.isArray(user.groups) 
              ? user.groups.includes('management')
              : user.groups === 'management'));
  };

  /**
   * Check if the user has editor permissions
   * 
   * @returns {boolean} True if user is an editor or admin
   */
  const isEditor = () => {
    if (!user) return false;
    
    // Check if user is an admin or belongs to editors group
    return isAdmin() ||
           (user.groups && 
            (Array.isArray(user.groups) 
              ? user.groups.includes('editors')
              : user.groups === 'editors'));
  };

  /**
   * Check if the user is the owner of a resource
   * 
   * @param {Object} resource - Resource to check ownership of
   * @returns {boolean} True if user is the owner
   */
  const isOwner = (resource) => {
    if (!user || !resource) return false;
    
    // Check based on author_id or author.id
    const resourceAuthorId = resource.author_id || (resource.author && resource.author.id);
    return user.id === resourceAuthorId;
  };

  /**
   * Check if the user can edit a resource
   * 
   * @param {Object} resource - Resource to check edit permissions for
   * @returns {boolean} True if user can edit the resource
   */
  const canEdit = (resource) => {
    return isAdmin() || isEditor() || isOwner(resource);
  };

  /**
   * Check if the user can delete a resource
   * 
   * @param {Object} resource - Resource to check delete permissions for
   * @returns {boolean} True if user can delete the resource
   */
  const canDelete = (resource) => {
    // Only admins can delete
    return isAdmin();
  };

  return {
    isAdmin,
    isEditor,
    isOwner,
    canEdit,
    canDelete
  };
};

export default usePermissions;