import React, { useContext, useState, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';
import { StoreContext } from '../../Context/StoreContext'
import { api } from '../../utils/api';

const Navbar = ({ setShowLogin }) => {
    const [menu, setMenu] = useState("home");
    const [user, setUser] = useState(null);
    const { getTotalCartAmount, clearCart } = useContext(StoreContext);

    useEffect(() => {
        // Check if user is logged in
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handleLogout = () => {
        api.logout();
        setUser(null);
        clearCart();
    };

    return (
        <div className={`navbar ${user?.role === 'admin' ? 'admin-navbar' : ''}`}>
            <Link to='/'><img src={assets.logo} alt="Logo" className="logo" /></Link>

            {/* Only show menu for non-admin users */}
            {user?.role !== 'admin' && (
                <ul className="navbar-menu">
                    <li>
                        <Link to="/" onClick={() => setMenu("home")} className={menu === "home" ? "active" : ""}>
                            Home
                        </Link>
                    </li>
                    <li>
                        <a href="#explore-menu" onClick={() => setMenu("menu")} className={menu === "menu" ? "active" : ""}>
                            Menu
                        </a>
                    </li>
                    <li>
                        <a href="#footer" onClick={() => setMenu("contact-us")} className={menu === "contact-us" ? "active" : ""}>
                            Contact us
                        </a>
                    </li>
                </ul>
            )}

            <div className="navbar-right">


                {/* Only show cart for non-admin users */}
                {user?.role !== 'admin' && (
                    <>
                        <img src={assets.search_icon} alt="Search" className="search" />
                        <div className="navbar-search-icon">
                            <Link to='/cart'><img src={assets.basket_icon} alt="Basket" className="basket" /></Link>
                            <div className={getTotalCartAmount() > 0 ? "dot" : ""}></div>
                        </div>
                         {user && (
                            <Link to='/myorders' className="my-orders-btn">
                                My Orders
                            </Link>
                        )}
                    </>
                )}

                {user ? (
                    <div className="user-menu">
                        <span>Welcome, {user.name}</span>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                ) : (
                    <button onClick={() => setShowLogin(true)}>Sign in</button>
                )}
            </div>
        </div>
    );
};


export default Navbar;
