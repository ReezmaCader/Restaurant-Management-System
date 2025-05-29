import React, { useState } from 'react';
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { api } from '../../utils/api'

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
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (currState === "Sign Up") {
                const response = await api.register(formData);
                alert('Registration successful! Please login.');
                setCurrState("Login");
            } else {
                const response = await api.login({
                    email: formData.email,
                    password: formData.password
                });

                // Store token and user data
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));

                // Redirect based on role
                if (response.user.role === 'admin') {
                    window.location.href = '/admin';
                } else {
                    window.location.href = '/';
                }

                setShowLogin(false);
            }
        } catch (error) {
            setError(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login-popup'>
            <form className='login-popup-container' onSubmit={handleSubmit}>
                <div className="login-popup-title">
                    <h2>{currState}</h2>
                    <img onClick={() => setShowLogin(false)} src={assets.cross_icon} alt="" />
                </div>
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
                {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}
                <div className="login-popup-condition">
                    <input type="checkbox" required />
                    <p>By continuing, i agree to the terms of use & privacy policy.</p>
                </div>
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
