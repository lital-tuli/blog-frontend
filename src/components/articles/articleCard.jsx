import React, { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const ArticleCard = ({ article, viewMode = 'grid', showFullContent = false }) => {
  const { darkMode } = useSelector(state => state.ui);
  const { user } = useSelector(state => state.auth);
  
  // Check if user is author of the article
  const isAuthor = useMemo(() => 
    user && article.author_id === user.id,
  [user, article.author_id]);
  
  // Check if user can edit (author, admin, or editor)
  const canEdit = useMemo(() => {
    if (!user) return false;
    return isAuthor || 
      user.is_staff || 
      (user.groups && (
        user.groups.includes('editors') || 
        user.groups.includes('management')
      ));
  }, [user, isAuthor]);
  
  // Format publication date
  const formattedDate = useMemo(() => 
    new Date(article.publication_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
  [article.publication_date]);
  
  // Truncate content for preview
  const contentPreview = useMemo(() => {
    if (showFullContent) return article.content;
    return article.content?.length > 150 
      ? article.content.substring(0, 150) + '...' 
      : article.content;
  }, [article.content, showFullContent]);
  
  // Get status badge color
  const getStatusBadgeColor = useMemo(() => {
    switch(article.status) {
      case 'published': return 'bg-success';
      case 'draft': return 'bg-warning text-dark';
      case 'archived': return 'bg-secondary';
      default: return 'bg-info';
    }
  }, [article.status]);
  
  // List view layout
  if (viewMode === 'list') {
    return (
      <div className={`card border-0 shadow-sm mb-3 ${darkMode ? 'bg-dark text-light' : ''} hover-shadow`}>
        <div className="card-body p-4">
          <div className="row">
            <div className="col-md-8">
              <h4 className="card-title mb-2 fw-bold">
                <Link 
                  to={`/articles/${article.id}`} 
                  className={`text-decoration-none ${darkMode ? 'text-light' : 'text-primary'}`}
                >
                  {article.title}
                </Link>
              </h4>
              
              <div className="d-flex flex-wrap gap-2 mb-2 text-muted small">
                <span className="d-flex align-items-center">
                  <i className="fas fa-user-circle me-1"></i> {article.author_username}
                </span>
                <span className="d-flex align-items-center">
                  <i className="fas fa-calendar-alt me-1"></i> {formattedDate}
                </span>
                <span className="d-flex align-items-center">
                  <i className="fas fa-comments me-1"></i> {article.comment_count || 0}
                </span>
                
                {/* Only show status if user can edit */}
                {canEdit && (
                  <span className={`badge ${getStatusBadgeColor} d-flex align-items-center`}>
                    {article.status}
                  </span>
                )}
              </div>
              
              {article.tags && article.tags.length > 0 && (
                <div className="mb-2">
                  {article.tags.map((tag, index) => (
                    <Link 
                      key={index} 
                      to={`/articles?tag=${tag}`}
                      className={`badge bg-light ${darkMode ? 'text-dark' : 'text-secondary'} me-1 mb-1 text-decoration-none`}
                    >
                      <i className="fas fa-tag me-1 small"></i> {tag}
                    </Link>
                  ))}
                </div>
              )}
              
              <p className={`card-text ${darkMode ? 'text-light-50' : 'text-secondary'}`}>
                {contentPreview}
              </p>
            </div>
            
            <div className="col-md-4 d-flex flex-column justify-content-between align-items-end">
              {article.featured_image ? (
                <img 
                  src={article.featured_image} 
                  alt={article.title} 
                  className="img-fluid rounded mb-3"
                  style={{ maxHeight: '120px', objectFit: 'cover' }}
                />
              ) : (
                <div 
                  className="bg-light rounded d-flex align-items-center justify-content-center mb-3"
                  style={{ height: '120px', width: '100%' }}
                >
                  <i className="fas fa-newspaper text-secondary fa-3x"></i>
                </div>
              )}
              
              <div className="d-flex gap-2 mt-2">
                <Link 
                  to={`/articles/${article.id}`} 
                  className="btn btn-sm btn-primary"
                >
                  Read More <i className="fas fa-arrow-right ms-1"></i>
                </Link>
                
                {canEdit && (
                  <Link 
                    to={`/articles/${article.id}/edit`} 
                    className="btn btn-sm btn-outline-primary"
                  >
                    <i className="fas fa-edit"></i>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Grid view layout (default)
  return (
    <div className={`card h-100 border-0 shadow-sm ${darkMode ? 'bg-dark text-light' : ''} hover-shadow`}>
      {article.featured_image ? (
        <img 
          src={article.featured_image} 
          alt={article.title} 
          className="card-img-top"
          style={{ height: '180px', objectFit: 'cover' }}
        />
      ) : (
        <div 
          className="bg-light d-flex align-items-center justify-content-center"
          style={{ height: '180px' }}
        >
          <i className="fas fa-newspaper text-secondary fa-3x"></i>
        </div>
      )}
      
      <div className="card-body p-4">
        <h5 className="card-title mb-3 fw-bold">
          <Link 
            to={`/articles/${article.id}`} 
            className={`text-decoration-none ${darkMode ? 'text-light' : 'text-primary'} stretched-link`}
          >
            {article.title}
          </Link>
        </h5>
        
        <div className="d-flex justify-content-between mb-3 text-muted small">
          <span className="d-flex align-items-center">
            <i className="fas fa-user-circle me-1"></i> {article.author_username}
          </span>
          <span className="d-flex align-items-center">
            <i className="fas fa-calendar-alt me-1"></i> {formattedDate}
          </span>
        </div>
        
        {article.tags && article.tags.length > 0 && (
          <div className="mb-3">
            {article.tags.map((tag, index) => (
              <span key={index} className={`badge bg-light ${darkMode ? 'text-dark' : 'text-secondary'} me-1 mb-1`}>
                <i className="fas fa-tag me-1 small"></i> {tag}
              </span>
            ))}
          </div>
        )}
        
        <p className={`card-text ${darkMode ? 'text-light-50' : 'text-secondary'}`}>
          {contentPreview}
        </p>
      </div>
      
      <div className="card-footer bg-transparent border-0 text-end pt-0 pb-3 px-4">
        <div className="d-flex justify-content-between align-items-center">
          <span className="small text-muted">
            <i className="fas fa-comments me-1"></i> {article.comment_count || 0} comments
          </span>
          
          {canEdit && (
            <span className={`badge ${getStatusBadgeColor}`}>
              {article.status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

ArticleCard.propTypes = {
  article: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    author_username: PropTypes.string.isRequired,
    author_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    publication_date: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    comment_count: PropTypes.number,
    status: PropTypes.string,
    featured_image: PropTypes.string
  }).isRequired,
  viewMode: PropTypes.oneOf(['grid', 'list']),
  showFullContent: PropTypes.bool
};

// Memoize the component to prevent unnecessary re-renders
export default memo(ArticleCard);