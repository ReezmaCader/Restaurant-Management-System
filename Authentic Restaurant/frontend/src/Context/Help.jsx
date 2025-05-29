import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from './StoreContext';
import { api } from '../utils/api';

const Help = () => {
    const { cartItems, food_list, getTotalCartAmount, clearCart } = useContext(StoreContext);
    const [processing, setProcessing] = useState(true);
    const [orderCreated, setOrderCreated] = useState(false);
    const [error, setError] = useState('');
    const [orderDetails, setOrderDetails] = useState(null);
    const [paymentSuccessDetected, setPaymentSuccessDetected] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if this is a payment success redirect
        const urlParams = new URLSearchParams(window.location.search);
        const paymentIntent = urlParams.get('payment_intent');
        const redirectStatus = urlParams.get('redirect_status');

        console.log('Help page - URL Params:', { paymentIntent, redirectStatus });

        if (paymentIntent && redirectStatus === 'succeeded') {
           setPaymentSuccessDetected(true);
        } else {
            // If not a payment success, just show help content
            setProcessing(false);
            navigate('/order');
        }
    }, []);

    useEffect(() => {
        if (paymentSuccessDetected && food_list.length > 0 && Object.keys(cartItems).length > 0) {
            console.log('Both payment success and data ready, processing order...');
            handlePaymentSuccess();
        }
    }, [paymentSuccessDetected, food_list, cartItems]);

    const calculateItemDetails = () => {
        const items = [];
        console.log('Calculating item details for cart items:', cartItems);
        for (const itemId in cartItems) {
            console.log('Calculating item details for itemId:', itemId);
            console.log('Cart Items:', cartItems);
            if (cartItems[itemId] > 0) {
                const menuItem = food_list.find(item => item.itemId == itemId);
                if (menuItem) {
                    console.log('Menu Item:', menuItem);
                    let itemPrice = menuItem.price;
                    let finalPrice = itemPrice;

                    // Apply discount
                    if (menuItem.discount > 0) {
                        finalPrice = itemPrice * (1 - menuItem.discount / 100);
                    }

                    const quantity = cartItems[itemId];
                    let total = finalPrice * quantity;

                    // Handle BOGO
                    if (menuItem.freeItem) {
                        const payableQuantity = Math.ceil(quantity);
                        total = finalPrice * payableQuantity;
                    }

                    items.push({
                        itemId: menuItem.itemId,
                        name: menuItem.name,
                        price: finalPrice,
                        quantity: quantity,
                        discount: menuItem.discount || 0,
                        freeItem: menuItem.freeItem || false,
                        total: Math.round(total * 100) / 100
                    });
                }
            }
        }

        return items;
    };

    const handlePaymentSuccess = async () => {
        console.log('Processing payment success in Help page');

        try {
            const pendingOrderData = localStorage.getItem('pendingOrder');
            if (!pendingOrderData) {
                throw new Error('No pending order found');
            }

            const pendingOrder = JSON.parse(pendingOrderData);
            const items = calculateItemDetails();
            const subtotal = getTotalCartAmount();
            const deliveryCharge = Math.round(subtotal * 0.1 * 100) / 100;
            const total = Math.round((subtotal + deliveryCharge) * 100) / 100;

            const orderData = {
                ...pendingOrder,
                items: items,
                subtotal: subtotal,
                deliveryCharge: deliveryCharge,
                total: total,
                paymentStatus: "paid"
            };

            console.log('Creating order with data:', orderData);

            // Create order in backend
            const response = await api.createOrder(orderData);
            console.log('Order created successfully:', response);

            // Set order details for display
            setOrderDetails(response);

            // Clear cart and pending order
            clearCart();
            localStorage.removeItem('pendingOrder');
            setOrderCreated(true);
            navigate('/myorders');

        } catch (error) {
            console.error('Error creating order:', error);
            setError('Failed to create order. Please contact support.');
        } finally {
            setProcessing(false);
        }
    };

};

export default Help;
