import { createContext, useEffect, useState } from "react";
import { api } from "../utils/api";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState({});
    const [food_list, setFoodList] = useState([]);

    useEffect(() => {
        fetchMenuItems();
        loadCartFromStorage();
    }, []);

    // Save cart to localStorage whenever cartItems changes
    useEffect(() => {
        if (Object.keys(cartItems).length > 0) {
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        }
    }, [cartItems]);

    const loadCartFromStorage = () => {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                setCartItems(parsedCart);
            } catch (error) {
                console.error('Error loading cart from storage:', error);
                localStorage.removeItem('cartItems');
            }
        }
    };

    const fetchMenuItems = async () => {
        try {
            const data = await api.getMenuItems();
            setFoodList(data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    const addToCart = (itemId) => {
        if (!cartItems[itemId]) {
            setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
        } else {
            setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
        }
    }

    const removeFromCart = (itemId) => {
        setCartItems((prev) => {
            const newCart = { ...prev };
            if (newCart[itemId] > 1) {
                newCart[itemId] = newCart[itemId] - 1;
            } else {
                delete newCart[itemId];
            }
            return newCart;
        });
    }

    const clearCart = () => {
        setCartItems({});
        localStorage.removeItem('cartItems');
    }

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const item in cartItems) {
            if (cartItems[item] > 0) {
                let itemInfo = food_list.find((product) => product.itemId == item);
                if (itemInfo) {
                    let itemPrice = itemInfo.price;
                    
                    // Apply discount if available
                    if (itemInfo.discount > 0) {
                        itemPrice = itemPrice * (1 - itemInfo.discount / 100);
                    }
                    
                    let quantity = cartItems[item];
                    
                    // Handle BOGO (Buy One Get One Free)
                    if (itemInfo.freeItem) {
                        // For BOGO, customer pays for half the quantity (rounded up)
                        const payableQuantity = Math.ceil(quantity / 2);
                        totalAmount += itemPrice * payableQuantity;
                    } else {
                        totalAmount += itemPrice * quantity;
                    }
                }
            }
        }
        // Round to 2 decimal places to avoid floating point precision issues
        return Math.round(totalAmount * 100) / 100;
    }

    const contextValue = {
        food_list,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        clearCart
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;
