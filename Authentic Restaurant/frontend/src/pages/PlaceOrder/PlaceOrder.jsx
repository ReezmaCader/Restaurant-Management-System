import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {
  const { getTotalCartAmount, cartItems, food_list } = useContext(StoreContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    phone: ''
  });

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Pre-fill form with user data
      const nameParts = parsedUser.name.split(' ');
      setFormData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: parsedUser.email || '',
        street: parsedUser.address || '',
        phone: parsedUser.phone_number || ''
      });
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProceedToPayment = () => {
    // Save order data to localStorage for payment processing
    const orderData = {
      userId: user?.userId,
      items: Object.keys(cartItems).map(itemId => ({
        itemId: parseInt(itemId),
        quantity: cartItems[itemId]
      })),
      customerInfo: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: formData.street,
        phone: formData.phone
      }
    };

    localStorage.setItem('pendingOrder', JSON.stringify(orderData));
    navigate('/payment');
  };

  const subtotal = getTotalCartAmount();
  const deliveryFee = Math.round(subtotal * 0.1 * 100) / 100;
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;

  return (
    <form className='place-order'>
      <div className="place-order-left">
        <p className='title'>Delivery Information</p>
        <div className="multi-field">
          <input 
            type="text" 
            name='firstName' 
            placeholder='First name'
            value={formData.firstName}
            onChange={handleInputChange}
            required
          />
          <input 
            type="text" 
            name='lastName' 
            placeholder='Last name'
            value={formData.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
        <input 
          type="email" 
          name='email' 
          placeholder='Email address'
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <input 
          type="text" 
          name='street' 
          placeholder='Address'
          value={formData.street}
          onChange={handleInputChange}
          required
        />
        <input 
          type="text" 
          name='phone' 
          placeholder='Phone'
          value={formData.phone}
          onChange={handleInputChange}
          required
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>Rs.{subtotal.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Charge(10%)</p>
              <p>Rs.{deliveryFee.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>Rs.{total.toFixed(2)}</b>
            </div>
          </div>
          <button 
            type="button" 
            onClick={handleProceedToPayment}
            disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.street || !formData.phone}
          >
            PROCEED TO PAYMENT
          </button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder
