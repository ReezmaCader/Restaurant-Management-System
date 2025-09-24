import React, { useContext, useState, useEffect } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import ToastMessage from '../../components/ToastMassage/ToastMessage';

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount, clearCart } = useContext(StoreContext);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    setUser(userData);
  }, []);

  const calculateItemTotal = (item, quantity) => {
    let itemPrice = item.price;

    // Apply discount if available
    if (item.discount > 0) {
      itemPrice = itemPrice * (1 - item.discount / 100);
    }

    // Handle BOGO
    if (item.freeItem) {
      const payableQuantity = Math.ceil(quantity);
      return Math.round(itemPrice * payableQuantity * 100) / 100;
    }

    return Math.round(itemPrice * quantity * 100) / 100;
  };

  const handleCart = () => {
    if(!user){
      setToast({ message: '⚠️ Please log in first to proceed', type: 'error' });
      return;
    }
    navigate('/order');
  };

  const subtotal = getTotalCartAmount();
  const deliveryFee = Math.round(120); 
  const total = Math.round((subtotal + deliveryFee) * 100) / 100;

  return (
    <div className="cart">
      <ToastMessage
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: '' })}
        duration={3000}
      />
      <div className="cart-items">
        <div className="cart-items-title">
          <p>Items</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <br />
        <hr />
        {food_list.map((item) => {
          if (cartItems[item.itemId] > 0) {
            const quantity = cartItems[item.itemId];
            const itemTotal = calculateItemTotal(item, quantity);
            const displayPrice = item.discount > 0 ?
              (Math.round(item.price * (1 - item.discount / 100) * 100) / 100).toFixed(2) :
              item.price.toFixed(2);

            return (
              <div key={item.itemId}>
                <div className="cart-items-title cart-items-item">
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-details">
                    <p>{item.name}</p>
                    {item.freeItem && <span className="bogo-indicator">BOGO</span>}
                    {item.discount > 0 && <span className="discount-indicator">{item.discount}% OFF</span>}
                  </div>
                  <p>Rs.{displayPrice}</p>
                  <div className="quantity-display">
                    <p>{quantity}</p>
                    {item.freeItem && <span className="free-items">({Math.floor(quantity)} free)</span>}
                  </div>
                  <p>Rs.{itemTotal.toFixed(2)}</p>
                  <p className="cart-items-remove-icon" onClick={() => removeFromCart(item.itemId)}>
                    <img src={assets.delete_icon} alt="" />
                  </p>
                </div>
                <hr />
              </div>
            )
          }
        })}
      </div>
      <div className="cart-bottom">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>Rs.{subtotal.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Charge</p>
              <p>Rs.{deliveryFee.toFixed(2)}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>Rs.{total.toFixed(2)}</b>
            </div>
          </div>
          <button
            onClick={handleCart}
            //disabled={!user}
          >PROCEED TO CHECKOUT</button>
        </div>
      </div>
    </div>
  )
}

export default Cart;
