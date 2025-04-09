import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllUsers } from '../store/usersSlice';
import UserManagementPanel from '../components/admin/UserManagementPanel';
import ArticleManagementPanel from '../components/admin/ArticleManagementPanel';
import StatsPanel from '../components/admin/StatsPanel';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const dispatch = useDispatch();
  const { users, isLoading } = useSelector(state => state.users);
  
  useEffect(() => {
    dispatch(fetchAllUsers());
  }, [dispatch]);

  return (
    <div className="container py-5">
      <h1 className="mb-4">Admin Dashboard</h1>
      
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <i className="fas fa-users me-2"></i>Users
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('articles')}
          >
            <i className="fas fa-newspaper me-2"></i>Articles
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <i className="fas fa-chart-bar me-2"></i>Statistics
          </button>
        </li>
      </ul>
      
      <div className="tab-content">
        {activeTab === 'users' && <UserManagementPanel users={users} isLoading={isLoading} />}
        {activeTab === 'articles' && <ArticleManagementPanel />}
        {activeTab === 'stats' && <StatsPanel />}
      </div>
    </div>
  );
};

export default AdminDashboard;