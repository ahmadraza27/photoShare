// ============================================
// src/pages/SearchPhotos.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { photoAPI } from '../services/api';
import {
  Search,
  Filter,
  X,
  Loader2,
  Image as ImageIcon,
  Eye,
  Star,
  MessageCircle,
  User,
  MapPin,
  Calendar,
  Tag,
  SlidersHorizontal,
  ChevronRight,
  Grid3x3,
  List,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

function SearchPhotos() {
  const [query, setQuery] = useState('');
  const [allPhotos, setAllPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();
  const location = useLocation();

  // Filters state
  const [filters, setFilters] = useState({
    sortBy: 'relevance',
    minRating: 0,
    minViews: 0,
    hasLocation: false,
    hasCaption: false,
    creator: '',
    dateRange: 'all'
  });

  // Check for search query in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      handleSearchProgrammatically(searchQuery);
    }
  }, [location]);

  // Apply filters whenever filters or allPhotos change
  useEffect(() => {
    if (allPhotos.length > 0) {
      applyFilters();
    }
  }, [applyFilters,filters, allPhotos]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setSearched(true);
    setShowFilters(false);

    try {
      const response = await photoAPI.search(query);
      setAllPhotos(response.data.results || response.data);
      
      // Update URL with search query
      navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchProgrammatically = async (searchQuery) => {
    setLoading(true);
    setSearched(true);
    
    try {
      const response = await photoAPI.search(searchQuery);
      setAllPhotos(response.data.results || response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let results = [...allPhotos];

    // Apply text search filter
    if (query.trim()) {
      const searchTerm = query.toLowerCase();
      results = results.filter(photo => 
        photo.title?.toLowerCase().includes(searchTerm) ||
        photo.caption?.toLowerCase().includes(searchTerm) ||
        photo.creator_username?.toLowerCase().includes(searchTerm) ||
        photo.location?.toLowerCase().includes(searchTerm) ||
        photo.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Apply minimum rating filter
    if (filters.minRating > 0) {
      results = results.filter(photo => 
        (photo.average_rating || 0) >= filters.minRating
      );
    }

    // Apply minimum views filter
    if (filters.minViews > 0) {
      results = results.filter(photo => 
        (photo.views_count || 0) >= filters.minViews
      );
    }

    // Apply has location filter
    if (filters.hasLocation) {
      results = results.filter(photo => 
        photo.location && photo.location.trim() !== ''
      );
    }

    // Apply has caption filter
    if (filters.hasCaption) {
      results = results.filter(photo => 
        photo.caption && photo.caption.trim() !== ''
      );
    }

    // Apply creator filter
    if (filters.creator.trim()) {
      const creatorName = filters.creator.toLowerCase();
      results = results.filter(photo => 
        photo.creator_username?.toLowerCase().includes(creatorName)
      );
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      results = results.filter(photo => {
        if (!photo.created_at) return false;
        const photoDate = new Date(photo.created_at);
        const diffTime = Math.abs(now - photoDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (filters.dateRange) {
          case 'today':
            return diffDays <= 1;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          case 'year':
            return diffDays <= 365;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (filters.sortBy) {
        case 'latest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'popular':
          return (b.views_count || 0) - (a.views_count || 0);
        case 'rating':
          return (b.average_rating || 0) - (a.average_rating || 0);
        case 'comments':
          return (b.comment_count || 0) - (a.comment_count || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default: // relevance
          // Keep original search relevance order for default
          return 0;
      }
    });

    setFilteredPhotos(results);
  };

  const handleClearSearch = () => {
    setQuery('');
    setAllPhotos([]);
    setFilteredPhotos([]);
    setSearched(false);
    setFilters({
      sortBy: 'relevance',
      minRating: 0,
      minViews: 0,
      hasLocation: false,
      hasCaption: false,
      creator: '',
      dateRange: 'all'
    });
    navigate('/search');
  };

  const handleClearFilters = () => {
    setFilters({
      sortBy: 'relevance',
      minRating: 0,
      minViews: 0,
      hasLocation: false,
      hasCaption: false,
      creator: '',
      dateRange: 'all'
    });
  };

  const fetchSuggestions = async (searchText) => {
    if (searchText.length < 2) {
      setSuggestions([]);
      return;
    }
    
    try {
      // Extract unique creators from photos
      const creators = [...new Set(allPhotos.map(p => p.creator_username).filter(Boolean))];
      const locations = [...new Set(allPhotos.map(p => p.location).filter(Boolean))];
      
      const mockSuggestions = [
        ...creators.map(creator => ({ type: 'creator', value: creator })),
        ...locations.map(location => ({ type: 'location', value: location })),
        { type: 'tag', value: 'landscape' },
        { type: 'tag', value: 'portrait' },
        { type: 'tag', value: 'nature' },
        { type: 'tag', value: 'city' },
        { type: 'tag', value: 'sunset' },
        { type: 'tag', value: 'travel' }
      ].filter(s => 
        s.value.toLowerCase().includes(searchText.toLowerCase())
      ).slice(0, 5);
      
      setSuggestions(mockSuggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.value);
    setTimeout(() => handleSearch(), 100);
  };

  const getUniqueCreators = () => {
    return [...new Set(allPhotos.map(p => p.creator_username).filter(Boolean))];
  };

  const getStats = () => {
    const totalViews = filteredPhotos.reduce((sum, p) => sum + (p.views_count || 0), 0);
    const avgRating = filteredPhotos.length > 0 
      ? (filteredPhotos.reduce((sum, p) => sum + (p.average_rating || 0), 0) / filteredPhotos.length).toFixed(1)
      : 0;
    const totalComments = filteredPhotos.reduce((sum, p) => sum + (p.comment_count || 0), 0);
    
    return { totalViews, avgRating, totalComments };
  };

  const stats = getStats();

  const PhotoCard = ({ photo }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
      <div 
        className={`photo-card-${viewMode}`} 
        onClick={() => navigate(`/photo/${photo.id}`)}
      >
        <div className="photo-image">
          <img 
            src={photo.image} 
            alt={photo.title}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
          {!imageLoaded && <div className="image-skeleton" />}
          
          {/* Rating badge */}
          {photo.average_rating >= 4 && (
            <div className="rating-badge">
              <Star size={12} />
              <span>{Number(photo.average_rating).toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <div className="photo-content">
          <div className="photo-header">
            <h3>{photo.title}</h3>
            <ChevronRight size={16} className="view-arrow" />
          </div>
          
          <div className="photo-meta">
            <div className="meta-item">
              <User size={12} />
              <span>{photo.creator_username}</span>
            </div>
            {photo.location && (
              <div className="meta-item">
                <MapPin size={12} />
                <span>{photo.location}</span>
              </div>
            )}
            {photo.created_at && (
              <div className="meta-item">
                <Calendar size={12} />
                <span>{new Date(photo.created_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          {photo.caption && viewMode === 'list' && (
            <p className="photo-caption">{photo.caption}</p>
          )}
          
          <div className="photo-stats">
            <div className="stat">
              <Eye size={14} />
              <span>{photo.views_count?.toLocaleString() || 0}</span>
            </div>
            <div className="stat">
              <Star size={14} />
              <span>{Number(photo.average_rating || 0).toFixed(1)}</span>
            </div>
            <div className="stat">
              <MessageCircle size={14} />
              <span>{photo.comment_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FilterPanel = () => {
    const creators = getUniqueCreators();
    
    return (
      <div className={`filter-panel ${showFilters ? 'open' : ''}`}>
        <div className="filter-header">
          <h3>Filters</h3>
          <div className="filter-header-actions">
            <button onClick={handleClearFilters} className="btn-text">
              Clear All
            </button>
            <button onClick={() => setShowFilters(false)} className="close-filters">
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="filter-section">
          <div className="filter-group">
            <label className="filter-label">
              <SlidersHorizontal size={16} />
              Sort Results
            </label>
            <div className="sort-options">
              {[
                { value: 'relevance', label: 'Relevance', icon: <Search size={14} /> },
                { value: 'latest', label: 'Latest', icon: <Clock size={14} /> },
                { value: 'popular', label: 'Popular', icon: <TrendingUp size={14} /> },
                { value: 'rating', label: 'Rating', icon: <Star size={14} /> },
                { value: 'comments', label: 'Comments', icon: <MessageCircle size={14} /> },
                { value: 'title', label: 'Title A-Z', icon: <Award size={14} /> }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilters({...filters, sortBy: option.value})}
                  className={`sort-option ${filters.sortBy === option.value ? 'active' : ''}`}
                >
                  {option.icon}
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">
              <Star size={16} />
              Minimum Rating
            </label>
            <div className="rating-slider">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating}
                onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
                className="slider"
              />
              <div className="slider-labels">
                <span>Any</span>
                <div className="current-rating">
                  <Star size={14} />
                  <span>{filters.minRating > 0 ? `${filters.minRating}+` : 'Any'}</span>
                </div>
                <span>5</span>
              </div>
            </div>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">
              <Eye size={16} />
              Minimum Views
            </label>
            <div className="views-filter">
              <select 
                value={filters.minViews}
                onChange={(e) => setFilters({...filters, minViews: parseInt(e.target.value)})}
                className="filter-select"
              >
                <option value="0">Any</option>
                <option value="100">100+</option>
                <option value="1000">1,000+</option>
                <option value="10000">10,000+</option>
                <option value="100000">100,000+</option>
                <option value="1000000">1M+</option>
              </select>
            </div>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">
              <User size={16} />
              Creator
            </label>
            <div className="creator-filter">
              <input
                type="text"
                value={filters.creator}
                onChange={(e) => setFilters({...filters, creator: e.target.value})}
                placeholder="Filter by creator..."
                className="creator-input"
              />
              {creators.length > 0 && (
                <div className="creator-suggestions">
                  {creators
                    .filter(creator => creator.toLowerCase().includes(filters.creator.toLowerCase()))
                    .slice(0, 5)
                    .map(creator => (
                      <button
                        key={creator}
                        onClick={() => setFilters({...filters, creator})}
                        className="creator-suggestion"
                      >
                        {creator}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">
              <Calendar size={16} />
              Date Posted
            </label>
            <div className="date-options">
              {[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'week', label: 'This Week' },
                { value: 'month', label: 'This Month' },
                { value: 'year', label: 'This Year' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setFilters({...filters, dateRange: option.value})}
                  className={`date-option ${filters.dateRange === option.value ? 'active' : ''}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="filter-group">
            <label className="filter-label">
              <MapPin size={16} />
              Content
            </label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.hasLocation}
                  onChange={(e) => setFilters({...filters, hasLocation: e.target.checked})}
                />
                <span>Has Location</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.hasCaption}
                  onChange={(e) => setFilters({...filters, hasCaption: e.target.checked})}
                />
                <span>Has Caption</span>
              </label>
            </div>
          </div>
        </div>
        
        <div className="filter-footer">
          <div className="filter-stats">
            <div className="filter-stat">
              <span className="stat-value">{filteredPhotos.length}</span>
              <span className="stat-label">Results</span>
            </div>
            <div className="filter-stat">
              <span className="stat-value">{stats.avgRating}</span>
              <span className="stat-label">Avg Rating</span>
            </div>
            <div className="filter-stat">
              <span className="stat-value">{stats.totalViews.toLocaleString()}</span>
              <span className="stat-label">Total Views</span>
            </div>
          </div>
          <button onClick={() => setShowFilters(false)} className="btn btn-primary">
            Apply Filters
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <div className="main-content">
        <div className="page-container">
          {/* Header */}
          <header className="search-header">
            <div>
              <h1 className="page-title">Search Photos</h1>
              <p className="page-subtitle">Discover amazing photography across our platform</p>
            </div>
          </header>

          {/* Search Bar */}
          <div className="search-section">
            <form onSubmit={handleSearch} className="search-form-container">
              <div className="search-input-wrapper">
                <Search size={20} className="search-icon" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    fetchSuggestions(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setSuggestions([]);
                    }
                  }}
                  placeholder="Search by title, caption, creator, location, or tags..."
                  className="search-input"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="clear-search-btn"
                    aria-label="Clear search"
                  >
                    <X size={18} />
                  </button>
                )}
                <button type="submit" className="search-submit-btn" disabled={loading}>
                  {loading ? <Loader2 size={20} className="spinner" /> : 'Search'}
                </button>
              </div>
              
              {/* Search Suggestions */}
              {suggestions.length > 0 && (
                <div className="search-suggestions">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="suggestion-item"
                    >
                      {suggestion.type === 'tag' && <Tag size={14} />}
                      {suggestion.type === 'creator' && <User size={14} />}
                      {suggestion.type === 'location' && <MapPin size={14} />}
                      <span>{suggestion.value}</span>
                    </button>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* Search Results */}
          {searched && (
            <div className="search-results-section">
              <div className="results-header">
                <div className="results-info">
                  {loading ? (
                    <div className="loading-indicator">
                      <Loader2 size={16} className="spinner" />
                      <span>Searching...</span>
                    </div>
                  ) : (
                    <>
                      <h2>
                        {filteredPhotos.length} {filteredPhotos.length === 1 ? 'result' : 'results'}
                        {query && ` for "${query}"`}
                      </h2>
                      <div className="active-filters">
                        {filters.sortBy !== 'relevance' && (
                          <span className="filter-tag">
                            {filters.sortBy === 'latest' ? 'Latest' : 
                             filters.sortBy === 'popular' ? 'Popular' : 
                             filters.sortBy === 'rating' ? 'Highest Rated' :
                             filters.sortBy === 'comments' ? 'Most Comments' :
                             'Title A-Z'}
                          </span>
                        )}
                        {filters.minRating > 0 && (
                          <span className="filter-tag">
                            <Star size={12} />
                            {filters.minRating}+ rating
                          </span>
                        )}
                        {filters.minViews > 0 && (
                          <span className="filter-tag">
                            <Eye size={12} />
                            {filters.minViews.toLocaleString()}+ views
                          </span>
                        )}
                        {filters.hasLocation && (
                          <span className="filter-tag">
                            <MapPin size={12} />
                            Has location
                          </span>
                        )}
                        {filters.hasCaption && (
                          <span className="filter-tag">
                            <MessageCircle size={12} />
                            Has caption
                          </span>
                        )}
                        {filters.creator && (
                          <span className="filter-tag">
                            <User size={12} />
                            {filters.creator}
                          </span>
                        )}
                        {filters.dateRange !== 'all' && (
                          <span className="filter-tag">
                            <Calendar size={12} />
                            {filters.dateRange === 'today' ? 'Today' :
                             filters.dateRange === 'week' ? 'This Week' :
                             filters.dateRange === 'month' ? 'This Month' : 'This Year'}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
                
                <div className="results-controls">
                  <div className="view-toggle">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                      title="Grid view"
                    >
                      <Grid3x3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                      title="List view"
                    >
                      <List size={18} />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="filter-toggle-btn"
                  >
                    <SlidersHorizontal size={18} />
                    <span>Filters</span>
                    {(filters.sortBy !== 'relevance' || filters.minRating > 0 || filters.minViews > 0 || 
                      filters.hasLocation || filters.hasCaption || filters.creator || filters.dateRange !== 'all') && (
                      <span className="filter-indicator"></span>
                    )}
                  </button>
                </div>
              </div>

              <div className="search-content">
                {/* Filter Panel */}
                <FilterPanel />
                
                {/* Results Grid/List */}
                {filteredPhotos.length > 0 ? (
                  <div className={`results-${viewMode}`}>
                    {filteredPhotos.map(photo => (
                      <PhotoCard key={photo.id} photo={photo} />
                    ))}
                  </div>
                ) : !loading && (
                  <div className="empty-results">
                    <div className="empty-icon">
                      <ImageIcon size={64} />
                    </div>
                    <h3>No photos found</h3>
                    <p>Try different keywords or adjust your filters</p>
                    <div className="empty-actions">
                      <button onClick={handleClearSearch} className="btn btn-outline">
                        Clear Search
                      </button>
                      <button onClick={() => setShowFilters(true)} className="btn btn-primary">
                        Adjust Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty State (before search) */}
          {!searched && (
            <div className="empty-search-state">
              <div className="empty-search-content">
                <Search size={64} className="empty-search-icon" />
                <h2>Start Searching</h2>
                <p>Search for photos by title, creator, location, or tags</p>
                <div className="search-examples">
                  <div className="example-section">
                    <h4>Try searching for:</h4>
                    <div className="example-tags">
                      <button onClick={() => setQuery('landscape')} className="example-tag">
                        landscape
                      </button>
                      <button onClick={() => setQuery('portrait')} className="example-tag">
                        portrait
                      </button>
                      <button onClick={() => setQuery('sunset')} className="example-tag">
                        sunset
                      </button>
                      <button onClick={() => setQuery('city')} className="example-tag">
                        city
                      </button>
                      <button onClick={() => setQuery('nature')} className="example-tag">
                        nature
                      </button>
                    </div>
                  </div>
                  <div className="example-section">
                    <h4>Popular creators:</h4>
                    <div className="example-tags">
                      <button onClick={() => setQuery('john_doe')} className="example-tag">
                        @john_doe
                      </button>
                      <button onClick={() => setQuery('jane_photography')} className="example-tag">
                        @jane_photography
                      </button>
                      <button onClick={() => setQuery('travel_lens')} className="example-tag">
                        @travel_lens
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPhotos;
