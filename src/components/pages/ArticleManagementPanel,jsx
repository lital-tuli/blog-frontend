import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchArticles, updateArticle, deleteArticle } from '../../store/articlesSlice';
import { useToastContext } from '../../context/ToastContext';

const ArticleManagementPanel = () => {
  const dispatch = useDispatch();
  const { articles, isLoading, error, totalPages, currentPage } = useSelector(state => state.articles);
  const { showSuccess, showError } = useToastContext();
  
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  useEffect(() => {
    const params = {
      page: currentPage,
      search: searchTerm || undefined,
      status: filterStatus || undefined
    };
    
    dispatch(fetchArticles(params));
  }, [dispatch, currentPage, searchTerm, filterStatus]);
  
  const handleStatusChange = async (articleId, newStatus) => {
    try {
      await dispatch(updateArticle({ 
        id: articleId, 
        status: newStatus 
      })).unwrap();
      
      showSuccess(`Article status updated to ${newStatus}`);
    } catch (error) {
      showError(error.message || 'Failed to update article status');
    }
  };
  
  const handleDeleteArticle = async () => {
    if (!selectedArticle) return;
    
    try {
      await dispatch(deleteArticle(selectedArticle.id)).unwrap();
      showSuccess('Article deleted successfully');
      setShowDeleteConfirm(false);
      setSelectedArticle(null);
    } catch (error) {
      showError(error.message || 'Failed to delete article');
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by the useEffect
  };
  
  if (isLoading && !articles.length) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading articles...</span>
        </div>
        <p className="mt-2">Loading articles...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="fas fa-exclamation-circle me-2"></i>
        {error.message || 'Failed to load articles'}
      </div>
    );
  }
  
  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'published': return 'bg-success';
      case 'draft': return 'bg-warning text-dark';
      case 'archived': return 'bg-secondary';
      default: return 'bg-info';
    }
  };
  
  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h3 className="card-title mb-4">Article Management</h3>
        
        <div className="row mb-4">
          <div className="col-md-6">
            <form onSubmit={handleSearch}>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search articles..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn btn-primary">
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </form>
          </div>
          <div className="col-md-4">
            <select 
              className="form-select" 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="col-md-2 text-end">
            <Link to="/articles/new" className="btn btn-success">
              <i className="fas fa-plus me-1"></i> New
            </Link>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles && articles.length > 0 ? (
                articles.map(article => (
                  <tr key={article.id}>
                    <td>{article.id}</td>
                    <td>
                      <Link to={`/articles/${article.id}`} className="text-decoration-none">
                        {article.title}
                      </Link>
                    </td>
                    <td>{article.author_username}</td>
                    <td>{new Date(article.publication_date).toLocaleDateString()}</td>
                    <td>
                      <select 
                        className="form-select form-select-sm" 
                        value={article.status}
                        onChange={(e) => handleStatusChange(article.id, e.target.value)}
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                    <td>
                      <Link 
                        to={`/articles/${article.id}/edit`} 
                        className="btn btn-sm btn-outline-primary me-1"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelectedArticle(article);
                          setShowDeleteConfirm(true);
                        }}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">No articles found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-4">
            <ul className="pagination justify-content-center">
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => dispatch({ 
                      type: 'articles/setCurrentPage', 
                      payload: i + 1 
                    })}
                  >
                    {i + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedArticle && (
          <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm Deletion</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setSelectedArticle(null);
                    }}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="alert alert-warning">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Are you sure you want to delete the article <strong>{selectedArticle.title}</strong>?
                    This action cannot be undone.
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setSelectedArticle(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={handleDeleteArticle}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleManagementPanel;