import React, { useState } from 'react';
import { api } from '../../utils/api';
import { uploadImage } from '../../utils/supabase';

function AddItem() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Sandwich',
    price: '',
    image: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    setError('');
    setSuccess('');

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
      setSuccess('Food item added successfully!');

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'Sandwich',
        price: '',
        image: ''
      });
      setImageFile(null);

    } catch (error) {
      setError(error.message || 'Failed to add food item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="content-title">Add New Food Item</h2>
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

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <input
          className="input"
          name="name"
          placeholder="Product name"
          value={formData.name}
          onChange={handleInputChange}
          required
        />

        <textarea
          className="input textarea"
          name="description"
          placeholder="Product description"
          value={formData.description}
          onChange={handleInputChange}
          required
        />

        <div className="form-row">
          <select
            className="input select"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            <option value="Sandwich">Sandwich</option>
            <option value="Pasta">Pasta</option>
            <option value="Indian">Indian</option>
            <option value="Cake">Cake</option>
            <option value="Pure Veg">Pure Veg</option>
            <option value="Noodles">Noodles</option>
            <option value="Deserts">Deserts</option>
          </select>

          <input
            className="input"
            name="price"
            type="number"
            step="0.01"
            placeholder="1000.00"
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <button className="add-btn" type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>
    </div>
  );
}

export default AddItem;
