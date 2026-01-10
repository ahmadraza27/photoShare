// ============================================
// src/pages/Home.jsx
// ============================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { photoAPI } from '../services/api';
import { useAuth } from '../App';
import {
  Camera,
  Sparkles,
  TrendingUp,
  Clock,
  Eye,
  Star,
  MessageCircle,
  ChevronRight,
  Users,
  Globe,
  Heart,
  Search,
  ArrowRight,
  Upload,
  Shield,
  Zap,
  Infinity,
  Cloud,
  Lock,
  Image as ImageIcon,
  Video,
  Filter,
  MapPin,
  User,
  Award,
  BarChart
} from 'lucide-react';

function Home() {
  const [photos, setPhotos] = useState([]);
  const [featuredPhotos, setFeaturedPhotos] = useState([]);
  const [trendingPhotos, setTrendingPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ totalPhotos: 0, totalUsers: 0, totalViews: 0 });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch in parallel for better performance
      const [photosRes, featuredRes, trendingRes] = await Promise.all([
        photoAPI.list({ ordering: '-created_at', limit: 6 }),
        photoAPI.list({ ordering: '-average_rating', limit: 3 }),
        photoAPI.list({ ordering: '-views_count', limit: 3 })
      ]);
      
      setPhotos(photosRes.data.results || photosRes.data);
      setFeaturedPhotos(featuredRes.data.results || featuredRes.data);
      setTrendingPhotos(trendingRes.data.results || trendingRes.data);
      
      // Mock stats - in production, this would come from an API
      setStats({
        totalPhotos: 15234,
        totalUsers: 3245,
        totalViews: 1256789
      });
      
    } catch (err) {
      setError('Failed to load content');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const PlatformFeatures = () => {
    const features = [
      {
        icon: <Cloud size={32} />,
        title: 'Cloud-Native Platform',
        description: 'Built on scalable cloud infrastructure for reliability and performance'
      },
      {
        icon: <Shield size={32} />,
        title: 'Secure Authentication',
        description: 'Role-based access control for creators and consumers'
      },
      {
        icon: <Zap size={32} />,
        title: 'Fast Media Delivery',
        description: 'Global CDN for lightning-fast photo loading'
      },
      {
        icon: <Infinity size={32} />,
        title: 'Scalable Storage',
        description: 'Unlimited photo storage with automatic optimization'
      }
    ];

    return (
      <div className="features-grid">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    );
  };

  const RoleCards = () => (
    <div className="roles-section">
      <div className="role-card creator">
        <div className="role-header">
          <Camera size={24} />
          <h3>For Creators</h3>
        </div>
        <ul className="role-features">
          <li><Upload size={16} /> Upload photos with metadata</li>
          <li><Lock size={16} /> Exclusive creator dashboard</li>
          <li><BarChart size={16} /> Track photo performance</li>
          <li><Award size={16} /> Build your portfolio</li>
        </ul>
        <div className="role-action">
          {/* <Link to="/creator" className="btn btn-primary"> */}
          {/* </Link> */}
          {/* <button className="btn btn-outline" onClick={() => navigate('/login')}> */}
          {/*   Become a Creator */}
          {/* </button> */}
          {user ? (
              ' Contact Administrator for Accessing The Creator Dashboard'
          ) : (

              ' Contact Administrator for Accessing The Creator Dashboard'
          )}
        </div>
      </div>
      
      <div className="role-card consumer">
        <div className="role-header">
          <Users size={24} />
          <h3>For Consumers</h3>
        </div>
        <ul className="role-features">
          <li><Search size={16} /> Discover amazing photos</li>
          <li><Heart size={16} /> Like and rate content</li>
          <li><MessageCircle size={16} /> Engage with comments</li>
          <li><Globe size={16} /> Global community access</li>
        </ul>
        <div className="role-action">


          {user ? (
            <Link to="/consumer" className="btn btn-primary">
              Explore Photos
            </Link>
          ) : (
            <button className="btn btn-outline" onClick={() => navigate('/register')}>
              Join Free
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const PhotoCard = ({ photo, type = 'standard' }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    return (
      <div 
        className={`photo-card-${type}`} 
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
          
          {type === 'featured' && (
            <div className="photo-badge">
              <Sparkles size={12} />
              <span>Featured</span>
            </div>
          )}
          
          {type === 'trending' && (
            <div className="photo-badge trending">
              <TrendingUp size={12} />
              <span>Trending</span>
            </div>
          )}
        </div>
        
        <div className="photo-content">
          <div className="photo-header">
            <h4>{photo.title}</h4>
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
          </div>
          
          <div className="photo-stats">
            <div className="stat">
              <Eye size={12} />
              <span>{photo.views_count?.toLocaleString() || 0}</span>
            </div>
            <div className="stat">
              <Star size={12} />
              <span>{Number(photo.average_rating || 0).toFixed(1)}</span>
            </div>
            <div className="stat">
              <MessageCircle size={12} />
              <span>{photo.comment_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading PhotoShare Platform...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Service Temporarily Unavailable</h3>
        <p>{error}</p>
        <p className="error-subtext">Our cloud-native infrastructure is scaling...</p>
        <button onClick={() => fetchData()} className="btn btn-primary">
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="main-content">
        <div className="page-container">
          {/* Hero Section */}
          <section className="hero-section">
            <div className="hero-content">
              <div className="hero-tag">
                <Sparkles size={16} />
                <span>Cloud-Native Photo Sharing</span>
              </div>
              <h1 className="hero-title">
                Share Your World Through
                <span className="hero-highlight"> Cloud-Powered</span>
                Photography
              </h1>
              <p className="hero-subtitle">
                A scalable platform for creators to share photos and consumers to discover 
                amazing visual content. Built on modern cloud infrastructure for maximum 
                reliability and performance.
              </p>
              <div className="hero-stats">
                <div className="hero-stat">
                  <div className="stat-number">{stats.totalPhotos.toLocaleString()}+</div>
                  <div className="stat-label">Photos Shared</div>
                </div>
                <div className="hero-stat">
                  <div className="stat-number">{stats.totalUsers.toLocaleString()}+</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="hero-stat">
                  <div className="stat-number">{stats.totalViews.toLocaleString()}+</div>
                  <div className="stat-label">Total Views</div>
                </div>
              </div>
              <div className="hero-actions">
                {user ? (
                  <>
                    <button onClick={() => navigate('/consumer')} className="btn btn-primary btn-large">
                      <Search size={20} />
                      Explore Photos
                    </button>
                    {/* <button onClick={() => navigate('/creator')} className="btn btn-outline btn-large"> */}
                    {/*   <Upload size={20} /> */}
                    {/*   Upload Photo */}
                    {/* </button> */}
                  </>
                ) : (
                  <>
                    <button onClick={() => navigate('/register')} className="btn btn-primary btn-large">
                      Join Free Today
                    </button>
                    <button onClick={() => navigate('/login')} className="btn btn-outline btn-large">
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="hero-visual">
              <div className="visual-grid">
                {photos.slice(0, 4).map((photo, index) => (
                  <div key={index} className="visual-item">
                    <img src={photo.image} alt="" loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Platform Features */}
          <section className="platform-section">
            <div className="section-header center">
              <h2>Built for Scale & Performance</h2>
              <p className="section-subtitle">
                Our cloud-native architecture ensures fast, reliable photo sharing 
                for creators and consumers worldwide
              </p>
            </div>
            <PlatformFeatures />
          </section>

          {/* Role-Based Access */}
          <section className="access-section">
            <div className="section-header center">
              <h2>Role-Based Experience</h2>
              <p className="section-subtitle">
                Dedicated interfaces for creators and consumers with appropriate access controls
              </p>
            </div>
            <RoleCards />
          </section>

          {/* Featured Content */}
          <section className="content-section">
            <div className="section-header">
              <div className="section-title">
                <Sparkles size={24} />
                <h2>Featured Photos</h2>
              </div>
              <Link to="/consumer" className="view-all-link">
                View All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="content-grid featured">
              {featuredPhotos.length > 0 ? (
                featuredPhotos.map(photo => (
                  <PhotoCard key={photo.id} photo={photo} type="featured" />
                ))
              ) : (
                <div className="empty-content">
                  <ImageIcon size={48} />
                  <p>No featured photos yet</p>
                </div>
              )}
            </div>
          </section>

          {/* Trending Content */}
          <section className="content-section">
            <div className="section-header">
              <div className="section-title">
                <TrendingUp size={24} />
                <h2>Trending Now</h2>
              </div>
              <Link to="/consumer?filter=trending" className="view-all-link">
                View All Trending <ArrowRight size={16} />
              </Link>
            </div>
            <div className="content-grid trending">
              {trendingPhotos.length > 0 ? (
                trendingPhotos.map(photo => (
                  <PhotoCard key={photo.id} photo={photo} type="trending" />
                ))
              ) : (
                <div className="empty-content">
                  <TrendingUp size={48} />
                  <p>No trending photos yet</p>
                </div>
              )}
            </div>
          </section>

          {/* Latest Content */}
          <section className="content-section">
            <div className="section-header">
              <div className="section-title">
                <Clock size={24} />
                <h2>Latest Photos</h2>
              </div>
              <Link to="/consumer" className="view-all-link">
                View All Photos <ArrowRight size={16} />
              </Link>
            </div>
            <div className="content-grid latest">
              {photos.length > 0 ? (
                photos.map(photo => (
                  <PhotoCard key={photo.id} photo={photo} type="latest" />
                ))
              ) : (
                <div className="empty-content">
                  <Camera size={48} />
                  <p>Be the first to share a photo!</p>
                  <button onClick={() => navigate('/upload')} className="btn btn-primary">
                    Upload First Photo
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* CTA Section */}
          <section className="cta-section">
            <div className="cta-content">
              <div className="cta-icon">
                <Cloud size={48} />
              </div>
              <h2>Ready to Experience Cloud-Powered Photo Sharing?</h2>
              <p>
                Join our scalable platform designed for creators who want to share 
                their vision and consumers who want to discover amazing photography.
              </p>
              <div className="cta-actions">
                {user ? (
                  <button onClick={() => navigate('/consumer')} className="btn btn-primary btn-large">
                    Continue Exploring
                  </button>
                ) : (
                  <>
                    <button onClick={() => navigate('/register')} className="btn btn-primary btn-large">
                      Join Platform
                    </button>
                    <button onClick={() => navigate('/login')} className="btn btn-outline btn-large">
                      Creator Login
                    </button>
                  </>
                )}
              </div>
              <div className="cta-note">
                <Lock size={14} />
                <span>Secure authentication & role-based access control</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Home;
