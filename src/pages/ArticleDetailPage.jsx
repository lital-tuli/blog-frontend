import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArticleById, deleteArticle, fetchArticles } from '../store/articlesSlice';
import { fetchComments } from '../store/commentsSlice';
import CommentSection from '../components/comments/CommentSection';
import { useToastContext } from '../context/ToastContext';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import { handleApiErrorWithUI } from '../utils/errorHandler';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useToastContext();
  
  const { article, isLoading: articleLoading, error: articleError } = useSelector(state => state.articles);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState([]);
  
  useEffect(() => {
    // Fetch article and its comments
    if (id) {
      dispatch(fetchArticleById(id))
        .unwrap()
        .catch(error => {
          handleApiErrorWithUI(error, showError);
        });
      
      // Fetch comments separately
      dispatch(fetchComments(id))
        .unwrap()
        .catch(error => {
          console.error('Failed to fetch comments:', error);
        });
    }
  }, [dispatch, id, showError]);

  // Fetch related articles based on tags when article loads
  useEffect(() => {
    if (article && article.tags && article.tags.length > 0) {
      // Create a simple related articles request using the first tag
      dispatch(fetchArticles({ tag: article.tags[0], limit: 3 }))
        .unwrap()
        .then(data => {
          // Filter out the current article
          const filtered = data.results ? 
            data.results.filter(a => a.id !== article.id) : 
            [];
          setRelatedArticles(filtered.slice(0, 3)); // Limit to 3 related articles
        })
        .catch(err => {
          console.error('Failed to fetch related articles:', err);
        });
    }
  }, [dispatch, article]);

  const handleDelete = () => {
    dispatch(deleteArticle(id))
      .unwrap()
      .then(() => {
        // Show success message
        showSuccess('Article deleted successfully');
        
        // Redirect to articles list after successful deletion
        navigate('/articles');
      })
      .catch(error => {
        handleApiErrorWithUI(error, showError);
        setShowDeleteModal(false);
      });
  };

  const isAuthor = article && user && article.author_id === user.id;
  const isAdmin = user?.is_staff || user?.groups?.includes('management');
  const isEditor = user?.groups?.includes('editors');
  const canEditArticle = isAdmin || isEditor || isAuthor;

  if (articleLoading && !article) {
    return <Loading message="Loading article..." />;
  }

  if (articleError) {
    return <ErrorMessage error={articleError} />;
  }

  if (!article) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Article not found.
        </div>
        <div className="text-center mt-4">
          <Link to="/articles" className="btn btn-primary">
            <i className="fas fa-arrow-left me-2"></i>
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  // Format publication date
  const formattedDate = new Date(article.publication_date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-light py-5">
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow border-0">
              <div className="card-body p-4 p-md-5">
                <h1 className="card-title mb-3 fw-bold">{article.title}</h1>
              
                <div className="d-flex flex-wrap justify-content-between mb-4">
                  <span className="text-muted d-flex align-items-center mb-2 mb-md-0">
                    <i className="fas fa-user-circle me-2"></i> {article.author_username}
                  </span>
                  <span className="text-muted d-flex align-items-center">
                    <i className="fas fa-calendar-alt me-2"></i> {formattedDate}
                  </span>
                </div>
            
                {article.tags && article.tags.length > 0 && (
                  <div className="mb-4">
                    {article.tags.map((tag, index) => (
                      <Link 
                        key={index} 
                        to={`/articles?tag=${tag}`}
                        className="badge bg-light text-secondary me-2 mb-2 text-decoration-none"
                      >
                        <i className="fas fa-tag me-1"></i> {tag}
                      </Link>
                    ))}
                  </div>
                )}
            
                {canEditArticle && (
                  <div className="mb-4 d-flex gap-2">
                    <Link 
                      to={`/articles/${id}/edit`} 
                      className="btn btn-sm btn-outline-primary"
                    >
                      <i className="fas fa-pencil-alt me-1"></i> Edit Article
                    </Link>
                    <button 
                      onClick={() => setShowDeleteModal(true)} 
                      className="btn btn-sm btn-outline-danger"
                    >
                      <i className="fas fa-trash me-1"></i> Delete Article
                    </button>
                  </div>
                )}

                <div className="article-content mb-5">
                  {article.content?.split('\n').map((paragraph, index) => (
                    paragraph ? 
                      <p key={index} className="mb-3 text-secondary lh-lg">{paragraph}</p> : 
                      <br key={index} />
                  )) || <p className="text-muted">No content available.</p>}
                </div>
          
                {/* Comment section */}
                <CommentSection 
                  articleId={id}
                  isAuthenticated={isAuthenticated}
                />
              </div>
            </div>
          </div>
          
          <div className="col-lg-4">
            {/* Author info card */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="fas fa-user-circle me-2"></i>
                  About the Author
                </h5>
              </div>
              <div className="card-body">
                <h6 className="fw-bold">{article.author_username}</h6>
                <Link to={`/profile/${article.author_id}`} className="btn btn-sm btn-outline-primary mt-2">
                  <i className="fas fa-user me-1"></i> View Profile
                </Link>
              </div>
            </div>
            
            {/* Related articles card */}
            <div className="card shadow-sm border-0 mb-4">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="fas fa-link me-2"></i>
                  Related Articles
                </h5>
              </div>
              <div className="card-body">
                {relatedArticles.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {relatedArticles.map(related => (
                      <Link 
                        key={related.id} 
                        to={`/articles/${related.id}`} 
                        className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                      >
                        <div className="me-2">
                          <span className="d-block fw-semibold">{related.title}</span>
                          <small className="text-muted">
                            {new Date(related.publication_date).toLocaleDateString()}
                          </small>
                        </div>
                        <i className="fas fa-chevron-right text-muted"></i>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0">No related articles found.</p>
                )}
                
                <div className="mt-3">
                  <Link to="/articles" className="btn btn-sm btn-primary w-100">
                    <i className="fas fa-newspaper me-1"></i> Browse All Articles
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Article stats card */}
            <div className="card shadow-sm border-0">
              <div className="card-header bg-light">
                <h5 className="mb-0">
                  <i className="fas fa-chart-bar me-2"></i>
                  Article Info
                </h5>
              </div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Published
                    <span className="badge bg-primary rounded-pill">
                      {new Date(article.publication_date).toLocaleDateString()}
                    </span>
                  </li>
                  {article.updated_at && (
                    <li className="list-group-item d-flex justify-content-between align-items-center">
                      Last Updated
                      <span className="badge bg-info rounded-pill">
                        {new Date(article.updated_at).toLocaleDateString()}
                      </span>
                    </li>
                  )}
                  <li className="list-group-item d-flex justify-content-between align-items-center">
                    Status
                    <span className={`badge rounded-pill ${
                      article.status === 'published' ? 'bg-success' : 
                      article.status === 'draft' ? 'bg-warning text-dark' : 
                      'bg-secondary'
                    }`}>
                      {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Article</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  aria-label="Close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Are you sure you want to delete this article? This action cannot be undone.
                </div>
                <p>
                  Title: <strong>{article.title}</strong>
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={handleDelete}
                >
                  <i className="fas fa-trash me-1"></i> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleDetailPage;