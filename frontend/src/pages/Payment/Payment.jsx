import React, { useContext } from "react";
import "./Payment.css";
import { StoreContext } from "../../Context/StoreContext";

const Payment = () => {
    const { cartItems, food_list, getTotalCartAmount } = useContext(StoreContext);
    const deliveryFee = getTotalCartAmount() * 0.1;
    const totalAmount = getTotalCartAmount() + deliveryFee;

    return (
        <form className="payment">
            <div className="paymentleft">
                <h2>Payment</h2>
                <h1>Rs. {totalAmount}.00</h1>
                <div className="order-details">
                    {food_list.map((item) => {
                        if (cartItems[item._id] > 0) {
                            return (
                                <div key={item._id}>
                                    <div className="item">
                                        <p>{item.name}</p>
                                        <p className="price">Rs.{item.price * cartItems[item._id]}.00</p>
                                    </div>
                                    <p className="quantity">Qty {cartItems[item._id]} - {item.price} each</p>
                                    <hr />
                                </div>
                            );
                        }
                    })}
                    <div className="item">
                        <p>Delivery Charge(10%)</p>
                        <p className="price">Rs.{deliveryFee}.00</p>
                    </div>
                </div>
            </div>

            <div className="payment-right">
                <div className="cart-total">
                    <h2>Pay with card</h2>
                    <form>
                        <label>Email</label>
                        <input type="email" placeholder="Enter your email" />

                        <label>Card information</label>
                        <div className="card-input">
                            <input type="text" className="card-number" placeholder="1234 1234 1234 1234" />
                            <div className="card-extra">
                                <input type="text" placeholder="MM / YY" />
                                <input type="text" placeholder="CVC" />
                            </div>
                        </div>


                        <label>Cardholder name</label>
                        <input type="text" placeholder="Full name on card" />

                        <label>Country or region</label>
                        <select>
                            <option>Sri Lanka</option>
                            <option>India</option>
                            <option>USA</option>
                            <option>UK</option>
                        </select>

                        <button type="submit">Pay</button>
                    </form>
                </div>
            </div>
        </form>
    );
};

export default Payment;
