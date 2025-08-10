import React, { useState } from 'react';
import { api } from '../../utils/api';
import { uploadImage } from '../../utils/supabase';
import ToastMessage from '../ToastMassage/ToastMessage';

function AddItem() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Indian',
    price: '',
    image: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setToast({ message: '', type: '' });
    try {
      let imageUrl = '';
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      const itemData = {
        ...formData,
        price: parseFloat(formData.price),
        image: imageUrl,
        discount: 0,
        freeItem: false,
        availability: true
      };
      await api.createMenuItem(itemData);
      setToast({ message: '🎉 Food item added successfully!', type: 'success' });
      setFormData({
        name: '',
        description: '',
        category: 'Sandwich',
        price: '',
        image: ''
      });
      setImageFile(null);
    } catch (error) {
      setToast({ message: error.message || 'Failed to add food item', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="content-title">Add New Food Item</h2>
      {/* Toast notification */}
      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
        duration={3000}
      />
      <form className="add-form" onSubmit={handleSubmit}>
        <div className={`upload-box ${imageFile ? 'has-file' : ''}`}>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required
          />
        </div>
        {imageFile && (
          <div className="file-info">
            Selected: {imageFile.name}
          </div>
        )}
        <input
          className="input"
          name="name"
          placeholder="Product name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
        {/* <textarea
          className="input textarea"
          name="description"
          placeholder="Product description"
          value={formData.description}
          onChange={handleInputChange}
          // required
        /> */}
        <div className="form-row">
          <select
            className="input select"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="Indian">Indian</option>
            <option value="Sandwich">Sandwich</option>
            <option value="Cake">Cake</option>
            <option value="Pure Veg">Pure Veg</option>
            <option value="Pasta">Pasta</option>
            <option value="Noodles">Noodles</option>
            <option value="Deserts">Deserts</option>
          </select>
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
        <button className="add-btn" type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>
    </div>
  );
}

export default AddItem;
