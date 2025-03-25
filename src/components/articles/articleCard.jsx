// src/components/articles/ArticleCard.jsx
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
    <div className="card h-100 shadow-sm">
      <div className="card-body">
        <h5 className="card-title">
          <Link to={`/articles/${id}`} className="text-decoration-none">{title}</Link>
        </h5>
        
        <div className="d-flex justify-content-between mb-2">
          <span className="text-muted small">By {author_username}</span>
          <span className="text-muted small">{formattedDate}</span>
        </div>
        
        <p className="card-text">{contentPreview}</p>
        
        {tags && tags.length > 0 && (
          <div className="mb-3">
            {tags.map((tag, index) => (
              <span key={index} className="badge bg-light text-dark me-1">
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <Link to={`/articles/${id}`} className="btn btn-sm btn-outline-primary">
          Read More
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;