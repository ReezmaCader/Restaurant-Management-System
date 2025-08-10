import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import ToastMessage from '../ToastMassage/ToastMessage';

function Discount() {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const data = await api.getMenuItems();
      setFoods(data);
      setError(null);
    } catch (error) {
      setToast({ message: '❌ Failed to fetch food items', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateDiscount = async (itemId, discount) => {
    try {
      await api.updateMenuItem(itemId, { discount: parseFloat(discount) });
      fetchFoods(); // Refresh the list
      setToast({ message: '💰 Discount updated successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to update discount', type: 'error' });
    }
  };

  const toggleFreeItem = async (itemId, currentFreeItem) => {
    try {
      await api.updateMenuItem(itemId, { freeItem: !currentFreeItem });
      fetchFoods(); // Refresh the list
      setToast({
        message: !currentFreeItem ? '🎁 BOGO offer activated!' : '🎁 BOGO offer deactivated',
        type: 'success'
      });
    } catch (error) {
      setToast({ message: 'Failed to update BOGO offer', type: 'error' });
    }
  };

  const handleDiscountChange = (itemId, value) => {
    if (value >= 0 && value <= 100) {
      updateDiscount(itemId, value);
    } else {
      setToast({ message: '⚠️ Discount must be between 0 and 100', type: 'error' });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
        duration={3000}
      />
      <h2 className="content-title">Manage Discounts & Offers</h2>
      <table className="food-table">
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Category</th>
            <th>Original Price</th>
            <th>Discount (%)</th>
            <th>Final Price</th>
            <th>Free Item (BOGO)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {foods.map((food) => {
            const finalPrice = food.price - (food.price * food.discount / 100);
            return (
              <tr key={food.itemId}>
                <td>
                  <img src={food.image} alt={food.name} className="food-img" />
                </td>
                <td>{food.name}</td>
                <td>{food.category}</td>
                <td>
                  <b>Rs.{food.price.toFixed(2)}</b>
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={food.discount}
                    onChange={(e) => {
                      const newFoods = foods.map(f =>
                        f.itemId === food.itemId
                          ? { ...f, discount: parseFloat(e.target.value) || 0 }
                          : f
                      );
                      setFoods(newFoods);
                    }}
                    onBlur={(e) => handleDiscountChange(food.itemId, e.target.value)}
                    style={{
                      width: '60px',
                      padding: '5px',
                      border: '1px solid #ccc',
                      borderRadius: '3px'
                    }}
                  />
                  %
                </td>
                <td>
                  <b style={{ color: food.discount > 0 ? '#4CAF50' : 'inherit' }}>
                    Rs.{finalPrice.toFixed(2)}
                  </b>
                  {food.discount > 0 && (
                    <div style={{ fontSize: '12px', color: '#4CAF50' }}>
                      Save: Rs.{(food.price - finalPrice).toFixed(2)}
                    </div>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => toggleFreeItem(food.itemId, food.freeItem)}
                    style={{
                      background: food.freeItem ? '#FF9800' : '#ccc',
                      color: food.freeItem ? 'white' : 'black',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    {food.freeItem ? 'BOGO Active' : 'No Offer'}
                  </button>
                </td>
                <td>
                  <button
                    onClick={() => updateDiscount(food.itemId, 0)}
                    style={{
                      background: '#f44336',
                      color: 'white',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Clear Discount
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '5px' }}>
        <h3>Quick Actions:</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              background: '#2196F3',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Apply Discount to All
          </button>

          <button
            onClick={() => setIsClearModalOpen(true)}
            style={{
              background: '#f44336',
              color: 'white',
              border: 'none',
              padding: '10px 15px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Clear All Discounts
          </button>
        </div>

        <DiscountModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onApply={(discount) => {
            foods.forEach(food => updateDiscount(food.itemId, discount));
            setToast({ message: '💰 Bulk discount applied successfully!', type: 'success' });
          }}
        />
        <ClearConfirmationModal
          isOpen={isClearModalOpen}
          onClose={() => setIsClearModalOpen(false)}
          onConfirm={() => {
            foods.forEach(food => updateDiscount(food.itemId, 0));
            setToast({ message: '🧹 All discounts cleared successfully!', type: 'success' });
          }}
        />
      </div>
    </div>
  );
}

function DiscountModal({ isOpen, onClose, onApply }) {
  const [discount, setDiscount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const discountValue = parseFloat(discount);
    if (discountValue >= 0 && discountValue <= 100) {
      onApply(discountValue);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Apply Bulk Discount</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="discount">Discount Percentage (0-100):</label>
            <input
              type="number"
              id="discount"
              min="0"
              max="100"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn-primary">Apply</button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ClearConfirmationModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Clear All Discounts</h3>
        <p>Are you sure you want to remove all discounts? This action cannot be undone.</p>
        <div className="modal-actions">
          <button 
            className="btn-primary" 
            style={{ background: '#f44336' }}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Clear All
          </button>
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default Discount;
