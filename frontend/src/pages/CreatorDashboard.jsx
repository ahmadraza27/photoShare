// ============================================
// src/pages/CreatorDashboard.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { photoAPI } from '../services/api';
import { useAuth } from '../App';
import {
  Eye,
  Star,
  MessageCircle,
  Plus,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  BarChart3,
  Users,
  MessageSquare
} from 'lucide-react';

function CreatorDashboard() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyPhotos();
  }, []);

  const fetchMyPhotos = async () => {
    try {
      const response = await photoAPI.list({ creator: user.id });
      setPhotos(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (photoId) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        await photoAPI.delete(photoId);
        setPhotos(photos.filter(p => p.id !== photoId));
      } catch (error) {
        alert('Failed to delete photo');
      }
    }
  };

  const calculateTotals = () => {
    const totalViews = photos.reduce((sum, p) => sum + (p.views_count || 0), 0);
    const totalComments = photos.reduce((sum, p) => sum + (p.comment_count || 0), 0);
    const avgRating = photos.length > 0 
      ? (photos.reduce((sum, p) => sum + (p.average_rating || 0), 0) / photos.length).toFixed(1)
      : 0;
    
    return { totalViews, totalComments, avgRating };
  };

  const { totalViews, totalComments, avgRating } = calculateTotals();

  if (loading) return <div className="loading">Loading...</div>;

  const PhotoCard = ({ photo }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
      <div className="photo-card-creator">
        <div className="photo-card-image">
          <img 
            src={photo.image} 
            alt={photo.title}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
          {!imageLoaded && <div className="image-skeleton" />}
        </div>
        
        <div className="photo-card-content">
          <h3>{photo.title}</h3>
          
          <div className="photo-stats">
            <div className="stat">
              <Eye size={14} />
              <span>{photo.views_count?.toLocaleString() || 0}</span>
            </div>
            {/* <div className="stat"> */}
            {/*   <Star size={14} /> */}
            {/*   <span>{Number(photo.average_rating || 0).toFixed(1)}</span> */}
            {/* </div> */}
            <div className="stat">
              <MessageCircle size={14} />
              <span>{photo.comment_count || 0}</span>
            </div>
          </div>
          
          <div className="photo-actions">
            <button 
              onClick={() => navigate(`/photo/${photo.id}`)}
              className="btn btn-small"
            >
              <ExternalLink size={14} />
              View
            </button>
            <button 
              onClick={() => handleDelete(photo.id)}
              className="btn btn-small btn-danger"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <div className="main-content">
        <div className="page-container">
          {/* Header */}
          <div className="dashboard-header">
            <div>
              <h1 className="page-title">Creator Dashboard</h1>
              <p className="page-subtitle">Manage your photography portfolio</p>
            </div>
            <button 
              onClick={() => navigate('/upload')} 
              className="btn btn-primary"
            >
              <Plus size={20} />
              Upload New Photo
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <ImageIcon size={32} />
              </div>
              <h3>{photos.length}</h3>
              <p>Total Photos</p>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <BarChart3 size={32} />
              </div>
              <h3>{totalViews.toLocaleString()}</h3>
              <p>Total Views</p>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <MessageSquare size={32} />
              </div>
              <h3>{totalComments}</h3>
              <p>Total Comments</p>
            </div>
            
            {/* <div className="stat-card"> */}
            {/*   <div className="stat-icon"> */}
            {/*     <Star size={32} /> */}
            {/*   </div> */}
            {/*   <h3>{avgRating}</h3> */}
            {/*   <p>Average Rating</p> */}
            {/* </div> */}
          </div>

          {/* My Photos Section */}
          <div className="section-header">
            <h2>My Photos</h2>
            <span className="photo-count">{photos.length} photos</span>
          </div>

          <div className="dashboard-grid">
            {photos.length > 0 ? (
              photos.map(photo => (
                <PhotoCard key={photo.id} photo={photo} />
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <ImageIcon size={64} />
                </div>
                <h3>No photos uploaded yet</h3>
                <p>Start building your photography portfolio by uploading your first photo.</p>
                <button 
                  onClick={() => navigate('/upload')} 
                  className="btn btn-primary"
                >
                  <Plus size={20} />
                  Upload Your First Photo
                </button>
              </div>
            )}
          </div>

          {/* Upload Promotion */}
          {photos.length > 0 && (
            <div className="upload-promo">
              <h2>Ready to share more of your work?</h2>
              <p>Upload another stunning photo to grow your portfolio and reach more viewers.</p>
              <button 
                onClick={() => navigate('/upload')} 
                className="btn"
              >
                <Plus size={20} />
                Upload Another Photo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreatorDashboard;
