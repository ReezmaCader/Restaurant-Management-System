import React, { useContext } from 'react'
import './FoodItem.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../Context/StoreContext';

const FoodItem = ({ id, name, price, description, image, averageRating, totalRatings, discount, freeItem }) => {
    const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);

    const calculateDiscountedPrice = () => {
        if (discount > 0) {
            return price * (1 - discount / 100);
        }
        return price;
    };

    const displayPrice = calculateDiscountedPrice();

    return (
        <div className='food-item'>
            <div className='food-item-img-container'>
                <img className='food-item-image' src={image} alt="" />

                {/* Discount Badge */}
                {discount > 0 && (
                    <div className="discount-badge">
                        {discount}% OFF
                    </div>
                )}

                {/* BOGO Badge */}
                {freeItem && (
                    <div className="bogo-badge">
                        BOGO
                    </div>
                )}

                {!cartItems[id]
                    ? <img className='add' onClick={() => addToCart(id)} src={assets.add_icon_white} alt="" />
                    : <div className="food-item-counter">
                        <img src={assets.remove_icon_red} onClick={() => removeFromCart(id)} alt="" />
                        <p>{cartItems[id]}</p>
                        <img src={assets.add_icon_green} onClick={() => addToCart(id)} alt="" />
                    </div>
                }
            </div>
            <div className="food-item-info">
                <h3>{name}</h3>
                <div className="food-item-name-rating">
                    
                    <div className="rating-display">
                        <div className="stars">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={star <= Math.round(averageRating || 0) ? "star filled" : "star"}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                        <span className="rating-text">
                            {averageRating ? `${averageRating.toFixed(1)} (${totalRatings})` : 'No ratings'}
                        </span>
                    </div>
                </div>

                <div className="food-item-price-container">
                    {discount > 0 ? (
                        <>
                            <p className="food-item-price discounted">Rs.{displayPrice.toFixed(2)}</p>
                            <p className="food-item-original-price">Rs.{price.toFixed(2)}</p>
                        </>
                    ) : (
                        <p className="food-item-price">Rs.{price.toFixed(2)}</p>
                    )}
                    {freeItem && (
                        <p className="bogo-text">Buy 1 Get 1 Free!</p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default FoodItem
