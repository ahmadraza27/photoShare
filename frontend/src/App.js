/**
 * Main App Component
 * ==================
 * Replace the entire contents of src/App.js with this file
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import './App.css';

// Import pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterCreator from './pages/RegisterCreator';
import CreatorDashboard from './pages/CreatorDashboard';
import ConsumerDashboard from './pages/ConsumerDashboard';
import PhotoDetail from './pages/PhotoDetail';
import UploadPhoto from './pages/UploadPhoto';
import SearchPhotos from './pages/SearchPhotos';
import ContactUs from './pages/ContactUs';

// Import API
import { authAPI } from './services/api';

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Auth Provider
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const loadUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await authAPI.login(username, password);
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      localStorage.setItem('token', response.data.token);
      setToken(response.data.token);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);

    navigate(`/`);
    // ;

  }
  const value = {
    user,
    token,
    login,
    logout,
    register,
    isAuthenticated: !!token && !!user,
    isCreator: user?.role === 'creator',
    isConsumer: user?.role === 'consumer',
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route
function ProtectedRoute({ children, requireCreator = false, requireConsumer = false }) {
  const { isAuthenticated, isCreator, isConsumer, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireCreator && !isCreator) {
    return <Navigate to="/consumer" replace />;
  }

  if (requireConsumer && !isConsumer) {
    return <Navigate to="/creator" replace />;
  }

  return children;
}

// Navigation
function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  console.log("user properties ");
  console.log(user);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          📸 PhotoShare
        </Link>

        <div className="nav-menu">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/search" className="nav-link">Search</Link>

          {isAuthenticated ? (
            <>
              {user?.role === 'creator' && (
                <>
                  <Link to="/creator" className="nav-link">Dashboard</Link>
                  <Link to="/upload" className="nav-link">Upload</Link>
                </>
              )}
              {user?.role === 'consumer' && (
                <Link to="/consumer" className="nav-link">Dashboard</Link>
              )}

              {user?.is_superuser && (
                <Link to="/register-creator" className="nav-link">Register A Creator</Link>
              )}
              <span className="nav-user">👤 {user?.username}</span>
              <button onClick={logout} className="nav-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/contact" className="nav-link">Contact Us</Link>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

// Main App
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navigation />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<SearchPhotos />} />
              <Route path="/photo/:id" element={<PhotoDetail />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route
                path="/creator"
                element={
                  <ProtectedRoute requireCreator>
                    <CreatorDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/upload"
                element={
                  <ProtectedRoute requireCreator>
                    <UploadPhoto />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/consumer"
                element={
                  <ProtectedRoute requireConsumer>
                    <ConsumerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/register-creator" element={

                <ProtectedRoute requireConsumer>
                  <RegisterCreator />

                </ProtectedRoute>
              } />

              <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
          </main>

          <footer className="footer">
            <p>&copy; 2025 PhotoShare. Built with Django + React</p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
