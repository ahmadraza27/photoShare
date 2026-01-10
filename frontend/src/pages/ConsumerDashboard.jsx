// ============================================
// src/pages/ConsumerDashboard.jsx
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { photoAPI } from '../services/api';
import {
  Search,
  Filter,
  TrendingUp,
  Clock,
  Eye,
  Star,
  MessageCircle,
  ChevronRight,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  User,
  MoreVertical,
  Heart,
  Download,
  Share2,
  X
} from 'lucide-react';

function ConsumerDashboard() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('trending');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPhotos();
  }, [filter]);

  const fetchPhotos = async (pageNum = 1, reset = true) => {
    try {
      setIsSearching(!!searchQuery);
      const params = {
        ordering: filter === 'trending' ? '-views_count' : '-created_at',
        page: pageNum,
        ...(searchQuery && { search: searchQuery })
      };

      const response = await photoAPI.list(params);
      const newPhotos = response.data.results || response.data;
      
      if (reset) {
        setPhotos(newPhotos);
      } else {
        setPhotos(prev => [...prev, ...newPhotos]);
      }
      
      setHasMore(!!response.data.next);
    } catch (error) {
      console.error('Failed to load photos:', error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const handleSearch = useCallback(async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setPage(1);
    await fetchPhotos(1, true);
  }, [searchQuery]);

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    setLoading(true);
    await fetchPhotos(nextPage, false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setLoading(true);
    setPage(1);
    fetchPhotos(1, true);
  };

  const PhotoCard = ({ photo }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
      <div className="photo-card-advanced" onClick={() => navigate(`/photo/${photo.id}`)}>
        <div className="photo-card-image">
          <img 
            src={photo.image} 
            alt={photo.title}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
          {!imageLoaded && <div className="image-skeleton" />}
          
          <div className="image-overlay">
            <div className="quick-actions">
              {/* <button className="quick-action-btn" onClick={(e) => { e.stopPropagation(); }}> */}
              {/*   <Heart size={16} /> */}
              {/* </button> */}
              <button className="quick-action-btn" onClick={(e) => { e.stopPropagation(); }}>
                <Download size={16} />
              </button>
              <button className="quick-action-btn" onClick={(e) => { e.stopPropagation(); }}>
                <Share2 size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="photo-card-content">
          <div className="photo-header">
            <div className="photo-title-wrapper">
              <h3>{photo.title}</h3>
              <ChevronRight size={18} className="view-arrow" />
            </div>
            <button className="more-options" onClick={(e) => { e.stopPropagation(); }}>
              <MoreVertical size={18} />
            </button>
          </div>
          
          <div className="photo-creator">
            <User size={14} />
            <span>{photo.creator_username}</span>
          </div>
          
          <div className="photo-stats">
            <div className="stat">
              <Eye size={16} />
              <span>{photo.views_count?.toLocaleString() || 0}</span>
            </div>
            <div className="stat">
              <Star size={16} />
              <span>{Number(photo.average_rating || 0).toFixed(1)}</span>
            </div>
            <div className="stat">
              <MessageCircle size={16} />
              <span>{photo.comment_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PhotoSkeleton = () => (
    <div className="photo-card skeleton">
      <div className="photo-card-image skeleton-image">
        <div className="image-skeleton" />
      </div>
      <div className="photo-card-content">
        <div className="skeleton-title" />
        <div className="skeleton-text" />
        <div className="photo-stats">
          <div className="skeleton-stat" />
          <div className="skeleton-stat" />
          <div className="skeleton-stat" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <div className="main-content">
        <div className="page-container">
          {/* Header */}
          <header className="dashboard-header">
            <div className="header-content">
              <div className="header-title">
                <div className="title-icon">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h1 className="page-title">Visual Gallery</h1>
                  <p className="page-subtitle">Discover and collect stunning photography</p>
                </div>
              </div>
            </div>
          </header>

          {/* Search & Filter Section */}
          <div className="search-filter-section">
            <form onSubmit={handleSearch} className="search-container">
              <div className="search-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search photos, creators, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="clear-search"
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
                <button type="submit" className="search-button">
                  {isSearching ? <Loader2 size={18} className="spinner" /> : 'Search'}
                </button>
              </div>
            </form>

            <div className="filter-container">
              <div className="filter-label">
                <Filter size={16} />
                <span>Sort by:</span>
              </div>
              <div className="filter-options">
                <button
                  onClick={() => setFilter('trending')}
                  className={`filter-option ${filter === 'trending' ? 'active' : ''}`}
                >
                  <TrendingUp size={16} />
                  Trending
                </button>
                <button
                  onClick={() => setFilter('latest')}
                  className={`filter-option ${filter === 'latest' ? 'active' : ''}`}
                >
                  <Clock size={16} />
                  Latest
                </button>
              </div>
            </div>
          </div>

          {/* Results Info */}
          {(searchQuery || isSearching) && (
            <div className="results-info">
              {isSearching ? (
                <div className="searching-indicator">
                  <Loader2 size={16} className="spinner" />
                  <span>Searching...</span>
                </div>
              ) : (
                <span className="results-count">
                  Found {photos.length} {photos.length === 1 ? 'result' : 'results'}
                  {searchQuery && ` for "${searchQuery}"`}
                </span>
              )}
            </div>
          )}

          {/* Photo Grid */}
          <div className="dashboard-grid">
            {loading && photos.length === 0 ? (
              // Initial loading skeleton
              <>
                {[...Array(6)].map((_, i) => (
                  <PhotoSkeleton key={`skeleton-${i}`} />
                ))}
              </>
            ) : photos.length > 0 ? (
              // Actual photo cards
              <>
                {photos.map(photo => (
                  <PhotoCard key={photo.id} photo={photo} />
                ))}
                {loading && (
                  // Loading more skeletons
                  <>
                    {[...Array(3)].map((_, i) => (
                      <PhotoSkeleton key={`loading-${i}`} />
                    ))}
                  </>
                )}
              </>
            ) : null}
          </div>

          {/* Empty State */}
          {photos.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ImageIcon size={64} />
              </div>
              <h3>No photos found</h3>
              <p>
                {searchQuery 
                  ? `No results for "${searchQuery}". Try different keywords.`
                  : "Start exploring amazing photography from our community."}
              </p>
              {searchQuery && (
                <button onClick={clearSearch} className="btn btn-outline">
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Load More */}
          {hasMore && photos.length > 0 && !loading && (
            <div className="load-more-container">
              <button onClick={handleLoadMore} className="load-more-btn">
                Load More
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Bottom Info */}
          {photos.length > 0 && (
            <div className="bottom-info">
              <p>Showing {photos.length} amazing photos • Keep scrolling for more inspiration</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConsumerDashboard;
