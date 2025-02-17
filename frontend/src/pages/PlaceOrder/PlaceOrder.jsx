import React, { useContext, useEffect, useState } from 'react'
import './PlaceOrder.css'
import { StoreContext } from '../../Context/StoreContext'
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const PlaceOrder = () => {

  const { getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();

  return (
    <form className='place-order'>
      <div className="place-order-left">
        <p className='title'>Delivery Information</p>
        <div className="multi-field">
          <input type="text" name='firstName' placeholder='First name' />
          <input type="text" name='lastName' placeholder='Last name' />
        </div>
        <input type="email" name='email' placeholder='Email address' />
        <input type="text" name='street' placeholder='Adress' />
        <input type="text" name='phone' placeholder='Phone' />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details"><p>Subtotal</p><p>Rs.{getTotalCartAmount()}.00</p></div>
            <hr />
            <div className="cart-total-details"><p>Delivery Charge(10%)</p><p>Rs.{getTotalCartAmount() * 10 / 100}.00</p></div>
            <hr />
            <div className="cart-total-details"><b>Total</b><b>Rs.{getTotalCartAmount() + getTotalCartAmount() * 10 / 100}.00</b></div>

          </div>
          <button onClick={() => navigate('/payment')}>PROCEED TO PAYMENT</button>

        </div>
      </div>
    </form>
  )
}

export default PlaceOrder