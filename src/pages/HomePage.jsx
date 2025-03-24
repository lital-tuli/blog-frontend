import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchArticles } from '../store/articlesSlice';
import ArticleCard from '../components/ArticleCard';

const HomePage = () => {
  const dispatch = useDispatch();
  const { articles, isLoading, error } = useSelector(state => state.articles);

  useEffect(() => {
    // Fetch only the 3 most recent published articles for the homepage
    dispatch(fetchArticles({ limit: 3, status: 'published' }));
  }, [dispatch]);

  if (isLoading && articles.length === 0) {
    return <div className="loading">Loading articles...</div>;
  }

  if (error) {
    return <div className="error">Error: {error.message}</div>;
  }

  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Our Blog</h1>
          <p>Discover the latest articles and share your thoughts</p>
          <Link to="/articles" className="button primary">Explore All Articles</Link>
        </div>
      </section>

      <section className="latest-articles">
        <div className="section-header">
          <h2>Latest Articles</h2>
          <Link to="/articles" className="see-all-link">See all articles</Link>
        </div>

        <div className="articles-grid">
          {articles.length > 0 ? (
            articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <p>No articles published yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;