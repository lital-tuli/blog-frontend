// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'

// Layout Components
import Navbar from './components/layout/Navbar'

// Pages
import HomePage from './pages/HomePage'
import ArticlesPage from './pages/ArticlesPage'
import ArticleDetailPage from './pages/ArticleDetailPage'
import ArticleForm from './pages/ArticleForm'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'

// Common Components
import PrivateRoute from './components/common/PrivateRoute'

function App() {
  return (
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
          <Route path="/profile/:id" element={<ProfilePage />} />
          
          {/* Protected Routes */}
          <Route 
            path="/articles/new" 
            element={
              <PrivateRoute>
                <ArticleForm />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/articles/:id/edit" 
            element={
              <PrivateRoute>
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
          
          {/* Fallback Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default App