import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArticles } from '../store/articlesSlice';
import ArticleCard from '../components/articles/ArticleCard';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

const HomePage = () => {
  const dispatch = useDispatch();
  const { articles, isLoading, error } = useSelector(state => state.articles);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    // Fetch all published articles 
    dispatch(fetchArticles({ status: 'published' }))
      .catch(err => {
        console.error('Failed to fetch articles:', err);
      });
  }, [dispatch]);

  return (
    <>
      {/* Hero Section with Background Image */}
      <div className="bg-primary text-white py-5">
        <div className="container">
          <div className="row align-items-center py-4">
            <div className="col-lg-6 text-center text-lg-start">
              <h1 className="display-4 fw-bold mb-3">Welcome to Django Blog</h1>
              <p className="lead fs-5 mb-4">
                Discover insightful articles, share your thoughts, and join our growing community of writers and readers.
              </p>
              <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-lg-start">
                <Link to="/articles" className="btn btn-light btn-lg shadow-sm">
                  <i className="fas fa-newspaper me-2"></i>Browse Articles
                </Link>
                {!isAuthenticated && (
                  <Link to="/register" className="btn btn-outline-light btn-lg">
                    <i className="fas fa-user-plus me-2"></i>Join Now
                  </Link>
                )}
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block text-center">
              <i className="fas fa-book-reader fa-10x mt-4 opacity-75"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Articles Section */}
      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold">
                <i className="fas fa-fire text-primary me-2"></i>Latest Articles
              </h2>
              <Link to="/articles" className="btn btn-sm btn-outline-primary">
                View all <i className="fas fa-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && articles.length === 0 && (
          <Loading message="Loading articles..." className="my-5" />
        )}

        {/* Error State */}
        {error && (
          <ErrorMessage error={error} />
        )}

        {/* Articles Grid */}
        <div className="row g-4">
          {articles.length > 0 ? (
            articles.slice(0, 6).map(article => (
              <div key={article.id} className="col-md-4 mb-4">
                <ArticleCard article={article} />
              </div>
            ))
          ) : (
            !isLoading && (
              <div className="col-12 text-center py-5">
                <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                <p className="lead">No articles published yet.</p>
              </div>
            )
          )}
        </div>

        {/* Show more button if there are more than 6 articles */}
        {articles.length > 6 && (
          <div className="text-center mt-4">
            <Link to="/articles" className="btn btn-primary">
              <i className="fas fa-list me-2"></i> View All Articles
            </Link>
          </div>
        )}

        {/* Features Section */}
        <div className="row mt-5 pt-5 border-top">
          <div className="col-12 text-center mb-4">
            <h2 className="fw-bold mb-4">Why Join Our Community?</h2>
          </div>
          <div className="col-md-4 mb-4 mb-md-0">
            <div className="text-center">
              <div className="bg-light p-3 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="fas fa-pen-fancy fa-2x text-primary"></i>
              </div>
              <h4 className="fw-bold">Share Your Ideas</h4>
              <p className="text-muted">Create and publish articles on topics you're passionate about.</p>
            </div>
          </div>
          <div className="col-md-4 mb-4 mb-md-0">
            <div className="text-center">
              <div className="bg-light p-3 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="fas fa-comments fa-2x text-primary"></i>
              </div>
              <h4 className="fw-bold">Engage in Discussions</h4>
              <p className="text-muted">Comment on articles and interact with other readers and writers.</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="text-center">
              <div className="bg-light p-3 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                <i className="fas fa-bookmark fa-2x text-primary"></i>
              </div>
              <h4 className="fw-bold">Discover Content</h4>
              <p className="text-muted">Find articles on various topics that match your interests.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;