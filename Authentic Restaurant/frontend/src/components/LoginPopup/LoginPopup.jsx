import React, { useState, useEffect } from 'react';
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { api } from '../../utils/api'
import ToastMessage from '../ToastMassage/ToastMessage';

const LoginPopup = ({ setShowLogin }) => {
    const [currState, setCurrState] = useState("Sign Up");
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        address: '',
        phone_number: ''
    });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ message: '', type: '' });

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setToast({ message: '', type: '' });

        try {
            if (currState === "Sign Up") {
                const response = await api.register(formData);
                setToast({ message: '✨ Registration successful! Please login.', type: 'success' });
                setCurrState("Login");
            } else {
                const response = await api.login({
                    email: formData.email,
                    password: formData.password
                });

                // Store token and user data
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));

                setToast({ message: '🎉 Login successful!', type: 'success' });

                // Short delay to show success message before redirect
                setTimeout(() => {
                    // Redirect based on role
                    if (response.user.role === 'admin') {
                        window.location.href = '/admin';
                    } else {
                        window.location.href = '/';
                    }
                    setShowLogin(false);
                }, 1000);
            }
        } catch (error) {
            setToast({ message: error.message || 'Something went wrong', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Enter") {
                document.querySelector(".login-popup-container")?.requestSubmit();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className='login-popup'>
            <ToastMessage
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({ message: '', type: '' })}
                duration={3000}
            />
            <form className='login-popup-container' onSubmit={handleSubmit}>
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                </div>
                <button
                    className="login-popup-close"
                    onClick={() => setShowLogin(false)}
                    aria-label="Close"
                >
                    <img src={assets.close_icon} alt="Close" />
                </button>
                <div className="login-popup-inputs">
                    {currState === "Sign Up" && (
                        <input
                            type="text"
                            name="name"
                            placeholder='Your name'
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    )}
                    <input
                        type="email"
                        name="email"
                        placeholder='Your email'
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder='Password'
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                    />
                    {currState === "Sign Up" && (
                        <>
                            <input
                                type="text"
                                name="address"
                                placeholder='Your address'
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                            />
                            <input
                                type="tel"
                                name="phone_number"
                                placeholder='Phone number'
                                value={formData.phone_number}
                                onChange={handleInputChange}
                                required
                            />
                        </>
                    )}
                </div>
                {currState === "Sign Up" && (
                    <div className="login-popup-condition">
                        <input type="checkbox" required />
                        <p>By continuing, I agree to the terms of use & privacy policy.</p>
                    </div>
                )}
                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : (currState === "Login" ? "Login" : "Create account")}
                </button>
                {currState === "Login"
                    ? <p>Create a new account? <span onClick={() => setCurrState('Sign Up')}>Click here</span></p>
                    : <p>Already have an account? <span onClick={() => setCurrState('Login')}>Login here</span></p>
                }
            </form>
        </div>
    )
}

export default LoginPopup
