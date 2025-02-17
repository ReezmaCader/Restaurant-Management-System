import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();

  return (
    <div className="cart">
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
          if (cartItems[item._id] > 0) {
            return (
              <div>
                <div className="cart-items-title cart-items-item">
                  <img src={item.image} alt={item.food_name} />
                  <p>{item.name}</p>
                  <p>Rs.{item.price}.00</p>
                  <p>{cartItems[item._id]}</p>
                  <p>Rs.{item.price * cartItems[item._id]}.00</p>
                  <p className="cart-items-remove-icon" onClick={() => removeFromCart(item._id)}><img src={assets.delete_icon} onClick={() => removeFromCart(id)} alt="" /></p>
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
            <div className="cart-total-details"><p>Subtotal</p><p>Rs.{getTotalCartAmount()}.00</p></div>
            <hr />
            <div className="cart-total-details"><p>Delivery Charge(10%)</p><p>Rs.{getTotalCartAmount() * 10 / 100}.00</p></div>
            <hr />
            <div className="cart-total-details"><b>Total</b><b>Rs.{getTotalCartAmount() + getTotalCartAmount() * 10 / 100}.00</b></div>

          </div>
          <button onClick={() => navigate('/order')}>PROCEED TO CHECKOUT</button>

        </div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}

export default Cart;
