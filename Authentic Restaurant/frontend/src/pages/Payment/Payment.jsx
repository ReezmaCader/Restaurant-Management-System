import React, { useCallback, useContext, useEffect, useState } from "react";
import "./Payment.css";
import { StoreContext } from "../../Context/StoreContext";
import { loadStripe } from '@stripe/stripe-js';
import {
    EmbeddedCheckoutProvider,
    EmbeddedCheckout
} from '@stripe/react-stripe-js';
import { api } from "../../utils/api";
import { useNavigate } from 'react-router-dom';
import ToastMessage from '../../components/ToastMassage/ToastMessage';

const stripePromise = loadStripe('pk_test_51RL30Q4RrwrJsL3COD7A7MQc8QGaMoVfCDETnJywSofxxfEIYfSz0fQFRuwZLTkaRHJIpo6NCZZC8MDrQbelkwmV00kzkTVrVn');

const Payment = () => {
    const { cartItems, food_list, getTotalCartAmount } = useContext(StoreContext);
    const [pendingOrder, setPendingOrder] = useState(null);
    const [toast, setToast] = useState({ message: '', type: '' });
    const navigate = useNavigate();
    
    const deliveryFee = Math.round(120);
    const totalAmount = getTotalCartAmount() + deliveryFee;

    useEffect(() => {
        // Get pending order data
        const orderData = localStorage.getItem('pendingOrder');
        if (orderData) {
            setPendingOrder(JSON.parse(orderData));
        } else {
            // If no pending order, redirect to cart
            navigate('/cart');
        }
    }, [navigate]);

    const calculateItemTotal = (item, quantity) => {
        let itemPrice = item.price;

        // Apply discount if available
        if (item.discount > 0) {
            itemPrice = itemPrice * (1 - item.discount / 100);
        }

        // Handle BOGO
        if (item.freeItem) {
            const payableQuantity = Math.ceil(quantity);
            return itemPrice * payableQuantity;
        }

        return itemPrice * quantity;
    };

    const fetchClientSecret = useCallback(async () => {
        try {
            const payment = await api.getPayment(totalAmount);
            return payment.clientSecret;
        } catch (error) {
            console.error('Error fetching client secret:', error);
            setToast({ message: 'Failed to initialize payment. Please try again.', type: 'error' });
            throw error;
        }
    }, [totalAmount]);

    const options = { 
        fetchClientSecret
    };

    if (!pendingOrder) {
        return (
            <div className="payment-loading">
                <p>Loading payment details...</p>
            </div>
        );
    }

    return (
        <form className="payment">
            <ToastMessage
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: '', type: '' })}
                duration={3000}
            />
            <div className="paymentleft">
                <h2>Payment</h2>
                <h1>Rs. {totalAmount.toFixed(2)}</h1>
                <div className="order-details-con">
                    {food_list.map((item) => {
                        if (cartItems[item.itemId] > 0) {
                            const quantity = cartItems[item.itemId];
                            const itemTotal = calculateItemTotal(item, quantity);
                            const displayPrice = item.discount > 0 ?
                                (item.price * (1 - item.discount / 100)).toFixed(2) :
                                item.price.toFixed(2);
                            return (
                                <div key={item._id}>
                                    <div className="item">
                                        <div className="item-info">
                                            <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{item.name}</p>
                                            <div className="item-badges">
                                                {item.freeItem && <span className="bogo-badge-cont">BOGO</span>}
                                                {item.discount > 0 && <span className="discount-badge-cont">{item.discount}% OFF</span>}
                                            </div>
                                        </div>
                                        <p className="price">Rs.{itemTotal.toFixed(2)}</p>
                                    </div>
                                    <p className="quantity">Qty {quantity} each</p>
                                    {item.freeItem && (
                                        <p className="free-items">+ {Math.floor(quantity)} free items</p>
                                    )}
                                    <hr />
                                </div>
                            );
                        }
                        return null;
                    })}
                    <div className="item">
                        <p>Delivery Charge</p>
                        <p className="price">Rs.{deliveryFee.toFixed(2)}</p>
                    </div>
                </div>

                
            </div>

            <div className="payment-right">
                <div id="checkout">
                    <EmbeddedCheckoutProvider
                        stripe={stripePromise}
                        options={options}
                    >
                        <EmbeddedCheckout />
                    </EmbeddedCheckoutProvider>
                </div>
            </div>
        </form>
    );
};

export default Payment;
