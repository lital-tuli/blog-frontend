import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArticles, setCurrentPage } from '../store/articlesSlice';
import ArticleCard from '../components/articles/ArticleCard';

const ArticlesPage = () => {
  const dispatch = useDispatch();
  const { articles, isLoading, error, totalPages, currentPage } = useSelector(state => state.articles);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');

  useEffect(() => {
    // Fetch articles with current page and filters
    const params = {
      page: currentPage,
      search: searchTerm || undefined,
      tag: filterTag || undefined
    };
    
    dispatch(fetchArticles(params));
  }, [dispatch, currentPage, searchTerm, filterTag]);

  const handlePageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to first page when searching
    dispatch(setCurrentPage(1));
  };

  const handleTagFilter = (tag) => {
    setFilterTag(tag);
    dispatch(setCurrentPage(1));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterTag('');
    dispatch(setCurrentPage(1));
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4">Articles</h1>
      
      <div className="row mb-4">
        <div className="col-md-6">
          <form onSubmit={handleSearch} className="d-flex">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control me-2"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
        
        <div className="col-md-6 mt-3 mt-md-0">
          {filterTag && (
            <div className="d-inline-block me-2">
              <span className="badge bg-primary d-flex align-items-center p-2">
                Tag: {filterTag}
                <button 
                  onClick={() => setFilterTag('')}
                  className="btn-close btn-close-white ms-2"
                  style={{ fontSize: '0.5rem' }}
                  aria-label="Remove tag filter"
                ></button>
              </span>
            </div>
          )}
          
          {(searchTerm || filterTag) && (
            <button 
              onClick={clearFilters} 
              className="btn btn-sm btn-outline-secondary"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error.message}
        </div>
      )}
      
      {isLoading && articles.length === 0 ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading articles...</p>
        </div>
      ) : (
        <>
          {articles.length === 0 ? (
            <div className="alert alert-info">
              No articles found matching your criteria.
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {articles.map(article => (
                <div key={article.id} className="col">
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          )}
          
          {totalPages > 1 && (
            <nav aria-label="Page navigation" className="mt-5">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    aria-disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                
                {[...Array(totalPages).keys()].map(number => (
                  <li 
                    key={number + 1} 
                    className={`page-item ${currentPage === number + 1 ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(number + 1)}
                    >
                      {number + 1}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    aria-disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default ArticlesPage;