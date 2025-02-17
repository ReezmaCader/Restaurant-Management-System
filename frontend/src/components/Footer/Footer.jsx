import React from 'react'
import './Footer.css'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <div className='footer' id='footer'>
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logo} alt="" />
        </div>
        <div className="footer-content-center">
          <p>Discover a carefully crafted menu offering a wide range of mouthwatering dishes, prepared with the finest ingredients and a dedication to culinary excellence. Our goal is to make every meal a memorable experience, filled with flavor and satisfaction. </p>
        </div>
        <div className="footer-content-right">
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt="" />
            <img src={assets.instagram_icon} alt="" />
          </div>
        </div>
      </div>
      <div></div>
      <hr />
      <p className="footer-copyright">Copyright 2025 © Authentic Restaurant - All Right Reserved.</p>
    </div>
  )
}

export default Footer
