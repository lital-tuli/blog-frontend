import { Link } from 'react-router-dom';

const ArticleCard = ({ article }) => {
  // Extract the needed article data
  const { id, title, content, author_username, publication_date, tags } = article;
  
  // Format the date for display
  const formattedDate = new Date(publication_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Truncate content for preview
  const contentPreview = content.length > 150 
    ? content.substring(0, 150) + '...' 
    : content;
  
  return (
    <div className="card h-100 border-0 shadow-sm hover-shadow">
      <div className="card-body p-4">
        <h5 className="card-title mb-3 fw-bold">
          <Link to={`/articles/${id}`} className="text-decoration-none text-primary stretched-link">{title}</Link>
        </h5>
        
        <div className="d-flex justify-content-between mb-3 text-muted small">
          <span className="d-flex align-items-center">
            <i className="fas fa-user-circle me-1"></i> {author_username}
          </span>
          <span className="d-flex align-items-center">
            <i className="fas fa-calendar-alt me-1"></i> {formattedDate}
          </span>
        </div>
        
        <p className="card-text text-secondary">{contentPreview}</p>
        
        {tags && tags.length > 0 && (
          <div className="mb-3">
            {tags.map((tag, index) => (
              <span key={index} className="badge bg-light text-secondary me-1 mb-1">
                <i className="fas fa-tag me-1 small"></i> {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="card-footer bg-white border-0 text-end pt-0">
        <Link to={`/articles/${id}`} className="btn btn-sm btn-primary">
          Read More <i className="fas fa-arrow-right ms-1"></i>
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;