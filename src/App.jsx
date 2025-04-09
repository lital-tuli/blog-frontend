import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import './App.css'

// Layout Components
import Navbar from './components/layout/Navbar'

// Pages
import HomePage from './components/pages/HomePage.jsx';
import ArticlesPage from './components/pages/ArticlesPage.jsx'
import ArticleDetailPage from './components/pages/ArticleDetailPage.jsx'
import AdminDashboard from './components/pages/AdminDashboard.jsx'
import ArticleForm from './components/pages/ArticleForm.jsx'
import LoginPage from './components/pages/LoginPage.jsx'
import RegisterPage from './components/pages/RegisterPage.jsx'
import ProfilePage from './components/pages/ProfilePage.jsx'
import UnauthorizedPage from './components/pages/UnauthorizedPage.jsx' 

// Common Components
import PrivateRoute from './components/common/PrivateRoute'
import { ToastProvider } from './context/ToastContext';
import { logout, checkAuthState } from './store/authSlice';

function App() {
  const dispatch = useDispatch();

  // Check auth state on app load
  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);

  // Set up global logout event listener
  useEffect(() => {
    const handleLogout = () => {
      dispatch(logout());
    };
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, [dispatch]);

  return (
    <ToastProvider>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/articles/:id" element={<ArticleDetailPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Protected Routes */}
            <Route 
              path="/articles/new" 
              element={
                <PrivateRoute requiresEditor={true}>
                  <ArticleForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/articles/:id/edit" 
              element={
                <PrivateRoute requiresEditor={true}>
                  <ArticleForm />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/profile/:id" 
              element={<ProfilePage />} 
            />
            <Route 
              path="/admin" 
              element={
                <PrivateRoute requiresAdmin={true}>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;