// src/pages/HomePage.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArticles } from '../store/articlesSlice';
import ArticleCard from '../components/articles/ArticleCard';

const HomePage = () => {
  const dispatch = useDispatch();
  const { articles, isLoading, error } = useSelector(state => state.articles);

  useEffect(() => {
    // Fetch only the 3 most recent published articles for the homepage
    dispatch(fetchArticles({ limit: 3, status: 'published' }));
  }, [dispatch]);

  return (
    <div className="container py-5">
      {/* Hero Section */}
<div className="row mb-5">
  <div className="col-md-10 mx-auto">
    <div className="bg-primary text-white p-4 p-md-5 rounded shadow">
      <div className="text-center py-4">
        <h1 className="display-4 fw-bold">Welcome to Our Blog</h1>
        <p className="lead fs-4 opacity-90">Discover the latest articles and share your thoughts</p>
        <Link to="/articles" className="btn btn-light btn-lg mt-3 shadow-sm">
          <i className="bi bi-journal-text me-2"></i>Explore All Articles
        </Link>
      </div>
    </div>
  </div>
</div>

{/* Latest Articles Section */}
<div className="row">
  <div className="col-12">
    <div className="d-flex justify-content-between align-items-center mb-4">
      <h2 className="fw-bold">Latest Articles</h2>
      <Link to="/articles" className="btn btn-sm btn-outline-primary">
        See all articles <i className="bi bi-arrow-right ms-1"></i>
      </Link>
    </div>
  </div>
</div>

      {/* Loading State */}
      {isLoading && articles.length === 0 && (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading articles...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="alert alert-danger" role="alert">
          Error: {error.message}
        </div>
      )}

      {/* Articles Grid */}
      <div className="row g-4">
        {articles.length > 0 ? (
          articles.map(article => (
            <div key={article.id} className="col-md-4">
              <ArticleCard article={article} />
            </div>
          ))
        ) : (
          !isLoading && (
            <div className="col-12 text-center py-5">
              <p className="lead">No articles published yet.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default HomePage;