import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

function FoodList({ onEdit }) {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const data = await api.getMenuItems();
      setFoods(data);
    } catch (error) {
      setError('Failed to fetch food items');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (itemId, currentAvailability) => {
    try {
      await api.updateMenuItem(itemId, { availability: !currentAvailability });
      fetchFoods(); // Refresh the list
    } catch (error) {
      alert('Failed to update availability');
    }
  };

  const deleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.deleteMenuItem(itemId);
        fetchFoods(); // Refresh the list
      } catch (error) {
        alert('Failed to delete item');
      }
    }
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => ({
      ...prev,
      [itemId]: true
    }));
  };

  const handleImageLoad = (itemId) => {
    setImageErrors(prev => ({
      ...prev,
      [itemId]: false
    }));
  };

  const getImageSrc = (food) => {
    // If there's an error with this image, show placeholder
    if (imageErrors[food.itemId]) {
      return null;
    }

    // If image URL exists, use it
    if (food.image) {
      return food.image;
    }

    return null;
  };

  const renderFoodImage = (food) => {
    const imageSrc = getImageSrc(food);

    if (!imageSrc || imageErrors[food.itemId]) {
      // Show placeholder when no image or error
      return (
        <div className="food-img-placeholder">
          <span className="placeholder-icon">🍽️</span>
          <span className="placeholder-text">No Image</span>
        </div>
      );
    }

    return (
      <img
        src={imageSrc}
        alt={food.name}
        className="food-img"
        onError={() => handleImageError(food.itemId)}
        onLoad={() => handleImageLoad(food.itemId)}
        loading="lazy"
      />
    );
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div>
      <h2 className="content-title">All Foods List</h2>
      <table className="food-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Availability</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((food) => (
            <tr key={food.itemId} className={!food.availability ? "disabled-row" : ""}>
              <td className="image-cell">
                {renderFoodImage(food)}
              </td>
              <td className="name-cell">
                <div className="food-name">{food.name}</div>
                {food.description && (
                  <div className="food-description">{food.description.substring(0, 50)}...</div>
                )}
              </td>
              <td>
                <span className="category-badge">{food.category}</span>
              </td>
              <td>
                <div className="price-container">
                  <b className="price">Rs.{food.price.toFixed(2)}</b>
                  {food.discount > 0 && (
                    <div className="discount-info">
                      <span className="discount-badge-con">{food.discount}% OFF</span>
                      <span className="original-price">
                        Rs.{(food.price * (1 - food.discount / 100)).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {food.freeItem && (
                    <span className="bogo-badge-con">BOGO</span>
                  )}
                </div>
              </td>
              <td>
                <button
                  onClick={() => toggleAvailability(food.itemId, food.availability)}
                  className={`availability-btn ${food.availability ? 'available' : 'unavailable'}`}
                >
                  {food.availability ? 'Available' : 'Unavailable'}
                </button>
              </td>
              <td>
                <div className="action-buttons">
                  <span
                    className="action-icon delete"
                    onClick={() => deleteItem(food.itemId)}
                    title="Delete item"
                  >
                    🗑️
                  </span>
                  <span
                    className="action-icon edit"
                    onClick={() => onEdit && onEdit(food)}
                    title="Edit item"
                  >
                    ✏️
                  </span>
                  <span
                    className="action-icon view"
                    onClick={() => toggleAvailability(food.itemId, food.availability)}
                  >
                    👁️
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {foods.length === 0 && (
        <div className="empty-state">
          <p>No food items found. Add some items to get started!</p>
        </div>
      )}
    </div>
  );
}

export default FoodList;
