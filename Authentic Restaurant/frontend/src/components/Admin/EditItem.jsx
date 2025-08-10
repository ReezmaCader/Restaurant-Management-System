import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { uploadImage } from '../../utils/supabase';
import ToastMessage from '../ToastMassage/ToastMessage';

function EditItem({ item, onBack, onUpdate }) {
  const [formData, setFormData] = useState({
    price: '',
    image: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        price: item.price.toString(),
        image: item.image || ''
      });
    }
  }, [item]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, PNG, WebP)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      
      setImageFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast({ message: '', type: '' });

    try {
      let updateData = {
        price: parseFloat(formData.price)
      };

      if (imageFile) {
        console.log('Uploading new image...');
        const imageUrl = await uploadImage(imageFile);
        updateData.image = imageUrl;
        console.log('New image uploaded:', imageUrl);
      }

      console.log('Updating item:', item.itemId, updateData);
      await api.updateMenuItem(item.itemId, updateData);
      setToast({ message: '🎉 Item updated successfully!', type: 'success' });
      
      if (onUpdate) onUpdate();
      if (onBack) onBack();
      
    } catch (error) {
      console.error('Update error:', error);
      setToast({ message: error.message || 'Failed to update item', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return (
      <div className="edit-item-wrapper">
        <h2 className="content-title">No item selected</h2>
        <button onClick={onBack} className="edit-btn">
          Back to Food List
        </button>
      </div>
    );
  }

  return (
    <div className="edit-item-wrapper">
      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
        duration={3000}
      />
      <form className="" onSubmit={handleSubmit}>
        <div className="current-image-section">
          <label className="edit-label">Current Image</label>
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name} 
              className="current-image"
              style={{
                width: '150px', 
                height: '150px', 
                objectFit: 'cover',
                borderRadius: '8px',
                border: '2px solid #e0e0e0'
              }} 
            />
          ) : (
            <div className="no-image-placeholder">
              <span>No current image</span>
            </div>
          )}
        </div>
        
        <div className="image-upload-section">
          <label className="edit-label">Upload New Image (optional)</label>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleImageChange}
            className="file-input"
          />
          {imageFile && (
            <p className="file-selected">
              Selected: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
        </div>
        
        <div className="price-section">
          <label className="edit-label">Price Rs.</label>
          <input 
            className="input" 
            name="price"
            type="number"
            step="10"
            placeholder="1000.00" 
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>
        
        {error && <p className="error-message" style={{color: 'red'}}>{error}</p>}
        
        <div className="button-group" style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
          <button className="edit-btn" type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Item'}
          </button>
          <button 
            type="button" 
            onClick={onBack} 
            className="back-btn"
            style={{
              background: '#6c757d',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Back to List
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditItem;
