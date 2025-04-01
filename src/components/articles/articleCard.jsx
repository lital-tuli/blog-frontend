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
    <div className="card h-100 shadow-sm border-0 transition-hover">
    <div className="card-body">
      <h5 className="card-title mb-3">
        <Link to={`/articles/${id}`} className="text-decoration-none text-dark stretched-link">{title}</Link>
      </h5>
      
      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted small d-flex align-items-center">
          <i className="bi bi-person-circle me-1"></i> {author_username}
        </span>
        <span className="text-muted small d-flex align-items-center">
          <i className="bi bi-calendar me-1"></i> {formattedDate}
        </span>
      </div>
      
      <p className="card-text text-secondary">{contentPreview}</p>
      
      {tags && tags.length > 0 && (
        <div className="mb-3">
          {tags.map((tag, index) => (
            <span key={index} className="badge bg-light text-dark me-1">
              # {tag}
            </span>
          ))}
        </div>
      )}
    </div>
    <div className="card-footer bg-white border-top-0 text-end">
      <Link to={`/articles/${id}`} className="btn btn-sm btn-outline-primary stretched-link">
        Read More <i className="bi bi-arrow-right ms-1"></i>
      </Link>
    </div>
  </div>
  );
};

export default ArticleCard;