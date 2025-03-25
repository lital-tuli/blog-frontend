import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArticleById, deleteArticle } from '../store/articlesSlice';
import { fetchComments } from '../store/commentSlice';
import CommentSection from '../components/comments/CommentSection';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { article, isLoading: articleLoading, error: articleError } = useSelector(state => state.articles);
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  useEffect(() => {
    // Fetch article and its comments
    dispatch(fetchArticleById(id));
    dispatch(fetchComments(id));
  }, [dispatch, id]);

  const handleDelete = () => {
    dispatch(deleteArticle(id))
      .unwrap()
      .then(() => {
        // Redirect to articles list after successful deletion
        navigate('/articles');
      })
      .catch(error => {
        console.error('Failed to delete article:', error);
      });
  };

  // Check if current user is the author
  const isAuthor = article && user && article.author_id === user.id;

  if (articleLoading && !article) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading article...</p>
      </div>
    );
  }

  if (articleError) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger" role="alert">
          {articleError.message || 'Error loading article'}
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning" role="alert">
          Article not found.
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
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8 mx-auto">
          <div className="card shadow">
            <div className="card-body p-4">
              <h1 className="card-title mb-3">{article.title}</h1>
              
              <div className="d-flex justify-content-between mb-4">
                <span className="text-muted">By {article.author_username}</span>
                <span className="text-muted">{formattedDate}</span>
              </div>
              
              {article.tags && article.tags.length > 0 && (
                <div className="mb-4">
                  {article.tags.map((tag, index) => (
                    <span key={index} className="badge bg-light text-dark me-2">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {isAuthor && (
                <div className="mb-4">
                  <Link 
                    to={`/articles/${id}/edit`} 
                    className="btn btn-sm btn-outline-primary me-2"
                  >
                    Edit Article
                  </Link>
                  <button 
                    onClick={() => setShowDeleteModal(true)} 
                    className="btn btn-sm btn-outline-danger"
                  >
                    Delete Article
                  </button>
                </div>
              )}
              
              <div className="article-content mb-5">
                {article.content.split('\n').map((paragraph, index) => (
                  paragraph ? <p key={index} className="mb-3">{paragraph}</p> : <br key={index} />
                ))}
              </div>
              
              {/* Comment section */}
              <CommentSection 
                articleId={id}
                isAuthenticated={isAuthenticated}
              />
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
                <p>Are you sure you want to delete this article? This action cannot be undone.</p>
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
                  Delete
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