

// ============================================
// src/pages/UploadPhoto.jsx
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { photoAPI } from '../services/api';

function UploadPhoto() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    location: '',
    is_published: true,
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('caption', formData.caption);
    data.append('location', formData.location);
    data.append('is_published', formData.is_published);
    data.append('image', image);

    try {
      await photoAPI.create(data);
      navigate('/creator');
    } catch (err) {
      setError('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-container">
        <h2>Upload Photo</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Image *</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="form-input"
            />
            {preview && (
              <div className="image-preview">
                <img src={preview} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Caption</label>
            <textarea
              name="caption"
              value={formData.caption}
              onChange={handleChange}
              className="form-input"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-input"
            />
          </div>

          {/* <div className="form-group"> */}
          {/*   <label> */}
          {/*     <input */}
          {/*       type="checkbox" */}
          {/*       name="is_published" */}
          {/*       checked={formData.is_published} */}
          {/*       onChange={handleChange} */}
          {/*     /> */}
          {/*     {' '}Publish immediately */}
          {/*   </label> */}
          {/* </div> */}

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Uploading...' : 'Upload Photo'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UploadPhoto;
