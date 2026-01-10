// ============================================
// src/pages/PhotoDetail.jsx
// ============================================

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { photoAPI, commentAPI, ratingAPI } from '../services/api';
import { useAuth } from '../App';
import {
  ArrowLeft,
  Eye,
  Star,
  MessageCircle,
  MapPin,
  Calendar,
  User,
  Heart,
  Download,
  Share2,
  MoreVertical,
  Send,
  Flag,
  Bookmark,
  ThumbsUp,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Clock,
  Award,
  TrendingUp,
  Filter
} from 'lucide-react';

function PhotoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [photo, setPhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [relatedPhotos, setRelatedPhotos] = useState([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('comments');

  useEffect(() => {
    fetchPhoto();
    fetchComments();
  }, [id]);
  useEffect(() => {

      fetchRelatedPhotos();
  }, [photo]);

  const fetchPhoto = async () => {
    try {
      const response = await photoAPI.get(id);
      const photoData = response.data;
      console.log("the images are");
      console.log(photoData);

      setPhoto(photoData);
      setUserRating(photoData.user_rating || 0);
      setIsLiked(photoData.user_liked || false);
      setIsBookmarked(photoData.user_bookmarked || false);
    } catch (error) {
      console.error('Failed to load photo:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await commentAPI.list(id);
      setComments(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const fetchRelatedPhotos = async () => {
    console.log("fetching data for this user ", photo?.creator?.id);
    try {
      const response = await photoAPI.list({
        creator: photo?.creator?.id,
        limit: 4,
        exclude: id
      });
      // console.log("th")
      // console.log(response.data.results || response.data)
      setRelatedPhotos(response.data.results || response.data);
    } catch (error) {
      console.error('Failed to load related photos:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    setCommentLoading(true);
    try {
      await commentAPI.create({
        photo: id,
        content: newComment
      });
      setNewComment('');
      fetchComments();
    } catch (error) {
      alert('Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleRating = async (score) => {
    if (!isAuthenticated || user?.role !== 'consumer') {
      navigate('/login');
      return;
    }

    try {
      await ratingAPI.create(id, score);
      setUserRating(score);
      fetchPhoto();
    } catch (error) {
      alert('Failed to rate photo');
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      // In a real app, this would be an API call
      setIsLiked(!isLiked);
      // Update photo likes count
      setPhoto(prev => ({
        ...prev,
        likes_count: prev.likes_count + (isLiked ? -1 : 1)
      }));
    } catch (error) {
      console.error('Failed to like photo:', error);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      // In a real app, this would be an API call
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Failed to bookmark photo:', error);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: photo?.title,
        text: `Check out this photo: ${photo?.title}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    if (!photo?.image) return;

    const link = document.createElement('a');
    link.href = photo.image;
    link.download = `${photo.title.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CommentItem = ({ comment }) => (
    <div className="comment-item">
      <div className="comment-header">
        <div className="comment-user">
          <div className="user-avatar">
            {comment.user_avatar ? (
              <img src={comment.user_avatar} alt={comment.username} />
            ) : (
              <User size={20} />
            )}
          </div>
          <div>
            <div className="comment-user-info">
              <strong>{comment.username}</strong>
              {comment.is_creator && (
                <span className="creator-badge">Creator</span>
              )}
            </div>
            <span className="comment-time">{getTimeAgo(comment.created_at)}</span>
          </div>
        </div>
        <button className="comment-actions">
          <MoreVertical size={16} />
        </button>
      </div>
      <p className="comment-content">{comment.content}</p>
      <div className="comment-footer">
        <button className="comment-like">
          <ThumbsUp size={14} />
          <span>{comment.likes_count || 0}</span>
        </button>
        <button className="comment-reply">Reply</button>
      </div>
    </div>
  );

  const PhotoStats = () => (
    <div className="photo-stats-grid">
      <div className="stat-item">
        <div className="stat-icon">
          <Eye size={20} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{photo?.views_count?.toLocaleString() || 0}</div>
          <div className="stat-label">Views</div>
        </div>
      </div>
      <div className="stat-item">
        <div className="stat-icon">
          <Star size={20} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{Number(photo?.average_rating || 0).toFixed(1)}</div>
          <div className="stat-label">Rating</div>
          <div className="stat-sub">({photo?.rating_count || 0} ratings)</div>
        </div>
      </div>
      <div className="stat-item">
        <div className="stat-icon">
          <MessageCircle size={20} />
        </div>
        <div className="stat-info">
          <div className="stat-value">{photo?.comment_count || 0}</div>
          <div className="stat-label">Comments</div>
        </div>
      </div>
      <div className="stat-item">
        {/* <div className="stat-icon"> */}
        {/*   <Heart size={20} /> */}
        {/* </div> */}
        {/* <div className="stat-info"> */}
        {/*   <div className="stat-value">{photo?.likes_count?.toLocaleString() || 0}</div> */}
        {/*   <div className="stat-label">Likes</div> */}
        {/* </div> */}
      </div>
    </div>
  );

  const RatingStars = ({ interactive = true, size = 24, showScore = true }) => {
    const rating = photo?.average_rating || 0;
    // Ensure rating is a number
    const numericRating = typeof rating === 'number' ? rating : parseFloat(rating) || 0;
    const fullStars = Math.floor(numericRating);
    const hasHalfStar = numericRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="rating-display">
        <div className="stars-container">
          {[...Array(fullStars)].map((_, i) => (
            <Star
              key={`full-${i}`}
              size={size}
              className="star full"
              color="#FFD700"  /* This colors the outline */
              fill="#FFD700"   /* This colors the inside */
            />
          ))}
          {/* key={`full-${i}`} */}
          {hasHalfStar && (
            <Star
              size={size}
              className="star full"
              color="#FFD700"  /* This colors the outline */
              fill="#FFD700"   /* This colors the inside */
            />
          )}
          {/* <Star size={size} className="star half" fill="currentColor" /> */}
          {[...Array(emptyStars)].map((_, i) => (
            <Star key={`empty-${i}`} size={size} className="star empty" />
          ))}
        </div>
        {showScore && (
          <div className="rating-score">
            <span className="score">{numericRating.toFixed(1)}</span>
            <span className="total">/5</span>
          </div>
        )}
      </div>
    );
  };
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading photo details...</p>
      </div>
    );
  }

  if (!photo) {
    return (
      <div className="error-container">
        <div className="error-icon">
          <ImageIcon size={64} />
        </div>
        <h2>Photo Not Found</h2>
        <p>The photo you're looking for doesn't exist or has been removed.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Browse Photos
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="main-content">
        <div className="page-container">
          {/* Navigation Header */}
          <header className="photo-header">
            <button onClick={() => navigate(-1)} className="back-button">
              <ArrowLeft size={20} />
              Back
            </button>
            <h1 className="photo-title">{photo.title}</h1>
            {/* <div className="header-actions"> */}
            {/*   <button onClick={handleBookmark} className="icon-button" title="Save"> */}
            {/*     <Bookmark size={20} className={isBookmarked ? 'active' : ''} /> */}
            {/*   </button> */}
            {/*   <button onClick={handleShare} className="icon-button" title="Share"> */}
            {/*     <Share2 size={20} /> */}
            {/*   </button> */}
            {/*   <button className="icon-button" title="More options"> */}
            {/*     <MoreVertical size={20} /> */}
            {/*   </button> */}
            {/* </div> */}
          </header>

          <div className="photo-detail-container">
            {/* Main Photo Section */}
            <div className="photo-main-section">
              <div className="photo-image-container">
                <div className="image-wrapper">
                  <img
                    src={photo.image}
                    alt={photo.title}
                    onLoad={() => setImageLoaded(true)}
                    loading="lazy"
                    className={imageLoaded ? 'loaded' : ''}
                    onClick={() => setShowFullscreen(true)}
                  />
                  {!imageLoaded && <div className="image-skeleton" />}

                  <div className="image-overlay">
                    <button
                      onClick={handleDownload}
                      className="image-action download"
                      title="Download"
                    >
                      <Download size={20} />
                    </button>
                    <button
                      onClick={() => setShowFullscreen(true)}
                      className="image-action fullscreen"
                      title="Fullscreen"
                    >
                      <Maximize2 size={20} />
                    </button>
                  </div>
                </div>

                <div className="image-actions-bar">
                  {/* <button  */}
                  {/*   onClick={handleLike} */}
                  {/*   className={`action-button ${isLiked ? 'active' : ''}`} */}
                  {/* > */}
                  {/*   <Heart size={20} /> */}
                  {/*   <span>Like</span> */}
                  {/*   {photo.likes_count > 0 && ( */}
                  {/*     <span className="count">{photo.likes_count}</span> */}
                  {/*   )} */}
                  {/* </button> */}
                  <button
                    onClick={() => document.getElementById('comment-input')?.focus()}
                    className="action-button"
                  >
                    <MessageCircle size={20} />
                    <span>Comment</span>
                  </button>
                  <button onClick={handleShare} className="action-button">
                    <Share2 size={20} />
                    <span>Share</span>
                  </button>
                  <button onClick={handleDownload} className="action-button">
                    <Download size={20} />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Photo Info Sidebar */}
              <div className="photo-info-sidebar">
                <div className="creator-section">
                  <div className="creator-header">
                    <div className="creator-avatar">
                      {photo.creator?.avatar ? (
                        <img src={photo.creator.avatar} alt={photo.creator.username} />
                      ) : (
                        <User size={24} />
                      )}
                    </div>
                    <div className="creator-info">
                      <h3 className="creator-name">{photo.creator?.username}</h3>
                      <div className="creator-stats">
                        <span>{photo.creator?.photo_count || 0} photos</span>
                        {/* <span>•</span> */}
                        {/* <span>{photo.creator?.follower_count || 0} followers</span> */}
                      </div>
                    </div>
                    {/* <button className="btn btn-outline follow-btn"> */}
                    {/*   Follow */}
                    {/* </button> */}
                  </div>

                  {photo.caption && (
                    <div className="photo-caption">
                      <p>{photo.caption}</p>
                    </div>
                  )}

                  <div className="photo-meta">
                    {photo.location && (
                      <div className="meta-item">
                        <MapPin size={16} />
                        <span>{photo.location}</span>
                      </div>
                    )}
                    <div className="meta-item">
                      <Calendar size={16} />
                      <span>Posted {formatDate(photo.created_at)}</span>
                    </div>
                    {photo.tags && photo.tags.length > 0 && (
                      <div className="tags-section">
                        {photo.tags.map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Photo Stats */}
                <PhotoStats />

                {/* Rating Section */}
                {isAuthenticated && user?.role === 'consumer' && (
                  <div className="rating-section">
                    <div className="section-header">
                      <h3>Rate this photo</h3>
                      <RatingStars interactive={false} size={20} />
                    </div>
                    <div className="rating-selector">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => handleRating(star)}
                          className={`rating-star ${userRating >= star ? 'selected' : ''}`}
                          title={`${star} star${star > 1 ? 's' : ''}`}
                        >
                          <Star size={28} />
                          <span className="star-number">{star}</span>
                        </button>
                      ))}
                    </div>
                    <p className="rating-help">Click a star to rate</p>
                  </div>
                )}

                {/* Related Photos */}
                {relatedPhotos.length > 0 && (
                  <div className="related-section">
                    <div className="section-header">
                      <h3>More from {photo.creator?.username}</h3>
                      {/* <button  */}
                      {/*   onClick={() => navigate(`/creator/${photo.creator?.id}`)} */}
                      {/*   className="btn-text" */}
                      {/* > */}
                      {/*   View All */}
                      {/* </button> */}
                    </div>
                    <div className="related-grid">
                      {relatedPhotos.map(relatedPhoto => (
                        <div
                          key={relatedPhoto.id}
                          className="related-photo"
                          onClick={() => navigate(`/photo/${relatedPhoto.id}`)}
                        >
                          <img src={relatedPhoto.image} alt={relatedPhoto.title} />
                          <div className="related-overlay">
                            <div className="related-stats">
                              <span><Eye size={12} /> {relatedPhoto.views_count}</span>
                              <span><Star size={12} /> {Number(relatedPhoto.average_rating).toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="comments-section">
              <div className="comments-header">
                <div className="tabs">
                  <button
                    className={`tab ${activeTab === 'comments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('comments')}
                  >
                    <MessageCircle size={18} />
                    Comments ({comments.length})
                  </button>
                  <button
                    className={`tab ${activeTab === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveTab('details')}
                  >
                    <Filter size={18} />
                    Photo Details
                  </button>
                </div>
              </div>

              {activeTab === 'comments' ? (
                <>
                  {/* New Comment Form */}
                  {isAuthenticated && (
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                      <div className="comment-input-wrapper">
                        <div className="user-avatar">
                          {user?.avatar ? (
                            <img src={user.avatar} alt={user.username} />
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        <div className="input-container">
                          <textarea
                            id="comment-input"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="comment-input"
                            rows="2"
                          />
                          <div className="input-actions">
                            <button
                              type="submit"
                              className="send-button"
                              disabled={!newComment.trim() || commentLoading}
                            >
                              {commentLoading ? (
                                <div className="small-spinner"></div>
                              ) : (
                                <Send size={18} />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Comments List */}
                  <div className="comments-list">
                    {comments.length > 0 ? (
                      comments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} />
                      ))
                    ) : (
                      <div className="empty-comments">
                        <MessageCircle size={48} />
                        <h3>No comments yet</h3>
                        <p>Be the first to comment on this photo</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="photo-details-tab">
                  <div className="details-grid">
                    <div className="detail-item">
                      <div className="detail-label">
                        <Calendar size={16} />
                        <span>Upload Date</span>
                      </div>
                      <div className="detail-value">
                        {formatDate(photo.created_at)}
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <Clock size={16} />
                        <span>Last Updated</span>
                      </div>
                      <div className="detail-value">
                        {formatDate(photo.updated_at || photo.created_at)}
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <TrendingUp size={16} />
                        <span>Popularity Score</span>
                      </div>
                      <div className="detail-value">
                        {Math.round((photo.views_count || 0) / 100) * 100}
                      </div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-label">
                        <Award size={16} />
                        <span>Rating Distribution</span>
                      </div>
                      <div className="detail-value">
                        5⭐: {Math.round((photo.rating_distribution?.[5] || 0) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fullscreen Modal */}
          {showFullscreen && (
            <div className="fullscreen-modal">
              <div className="modal-header">
                <h3>{photo.title}</h3>
                <button onClick={() => setShowFullscreen(false)} className="close-modal">
                  <X size={24} />
                </button>
              </div>
              <div className="modal-content">
                <img src={photo.image} alt={photo.title} />
              </div>
              <div className="modal-footer">
                <div className="modal-actions">
                  <button onClick={handleDownload} className="btn btn-outline">
                    <Download size={18} />
                    Download
                  </button>
                  <button onClick={handleShare} className="btn btn-outline">
                    <Share2 size={18} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PhotoDetail;
