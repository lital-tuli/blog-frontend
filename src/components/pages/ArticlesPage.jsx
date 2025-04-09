import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArticles, setCurrentPage } from '../store/articlesSlice';
import ArticleCard from '../components/articles/ArticleCard';
import { Link } from 'react-router-dom';

const ArticlesPage = () => {
  const dispatch = useDispatch();
  const { articles, isLoading, error, totalPages, currentPage } = useSelector(state => state.articles);
  const { isAuthenticated } = useSelector(state => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    // Fetch articles with current page, filters, and sorting
    const params = {
      page: currentPage,
      search: searchTerm || undefined,
      tag: filterTag || undefined,
      ordering: sortBy === 'newest' ? '-publication_date' : 'publication_date'
    };
    
    dispatch(fetchArticles(params));
  }, [dispatch, currentPage, searchTerm, filterTag, sortBy]);

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

  // Sample tags for the filter sidebar
  const popularTags = ['django', 'python', 'react', 'javascript', 'web', 'api', 'tutorial', 'programming'];

  return (
    <div className="bg-light py-5">
      <div className="container">
        {/* Page Header */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <div className="row align-items-center">
              <div className="col-md-6 mb-3 mb-md-0">
                <h1 className="mb-0">
                  <i className="fas fa-newspaper text-primary me-2"></i>
                  Articles
                </h1>
                <p className="text-muted mb-0 mt-2">
                  Discover interesting articles from our community
                </p>
              </div>
              <div className="col-md-6">
                <form onSubmit={handleSearch} className="d-flex">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search"
                  />
                  <button type="submit" className="btn btn-primary ms-2">
                    <i className="fas fa-search"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
            <div className="row align-items-center">
              <div className="col-lg-4 mb-2 mb-lg-0">
                {/* Active Filters */}
                {filterTag && (
                  <div className="d-inline-block me-2 mb-2">
                    <span className="badge bg-primary d-flex align-items-center p-2">
                      <i className="fas fa-tag me-1"></i> {filterTag}
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
                    <i className="fas fa-times-circle me-1"></i> Clear Filters
                  </button>
                )}
              </div>
              
              <div className="col-lg-4 mb-2 mb-lg-0 text-center">
                {!isLoading && articles && articles.length > 0 && (
                  <span className="text-muted">
                    Showing {articles.length} of {totalPages * 10} articles
                  </span>
                )}
              </div>

              <div className="col-lg-4 text-lg-end">
                <div className="d-flex justify-content-lg-end align-items-center">
                  {/* Sort Options */}
                  <div className="dropdown me-2">
                    <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="sortDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                      <i className="fas fa-sort me-1"></i> 
                      {sortBy === 'newest' ? 'Newest First' : 'Oldest First'}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="sortDropdown">
                      <li>
                        <button 
                          className={`dropdown-item ${sortBy === 'newest' ? 'active' : ''}`}
                          onClick={() => setSortBy('newest')}
                        >
                          <i className="fas fa-arrow-down me-2"></i> Newest First
                        </button>
                      </li>
                      <li>
                        <button 
                          className={`dropdown-item ${sortBy === 'oldest' ? 'active' : ''}`}
                          onClick={() => setSortBy('oldest')}
                        >
                          <i className="fas fa-arrow-up me-2"></i> Oldest First
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="btn-group" role="group" aria-label="View mode">
                    <button 
                      type="button" 
                      className={`btn btn-outline-secondary ${viewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <i className="fas fa-th-large"></i>
                    </button>
                    <button 
                      type="button" 
                      className={`btn btn-outline-secondary ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => setViewMode('list')}
                    >
                      <i className="fas fa-list"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
          
        {/* Articles List */}
        <div className={`row ${viewMode === 'list' ? 'flex-column' : ''}`}>
          {/* Loading State */}
          {isLoading && (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading articles...</span>
              </div>
              <p className="mt-2">Loading articles...</p>
            </div>
          )}
          
          {/* Error State */}
          {error && (
            <div className="col-12">
              <div className="alert alert-danger" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error.message || "Failed to load articles. Please try again later."}
              </div>
            </div>
          )}
          
          {/* No Articles State */}
          {!isLoading && (!articles || articles.length === 0) && (
            <div className="col-12 text-center py-5">
              <i className="fas fa-newspaper fa-3x text-muted mb-3"></i>
              <p className="lead">No articles found. Try adjusting your search criteria.</p>
            </div>
          )}
          
          {/* Articles Grid */}
          {!isLoading && articles && articles.length > 0 && 
            articles.map(article => (
              <div key={article.id} className={`col-${viewMode === 'list' ? '12' : '6'} mb-4`}>
                <ArticleCard article={article} viewMode={viewMode} />
              </div>
            ))
          }
        </div>
        
        {/* Pagination */}
        {!isLoading && articles && articles.length > 0 && totalPages > 1 && (
          <nav aria-label="Page navigation">
            <ul className="pagination justify-content-center">
              {Array.from({ length: totalPages }, (_, index) => (
                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
        
        {/* Add Article Button */}
        {isAuthenticated && (
          <div className="text-center mt-4">
            <Link to="/articles/new" className="btn btn-primary">
              <i className="fas fa-plus-circle me-2"></i> Add New Article
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlesPage;