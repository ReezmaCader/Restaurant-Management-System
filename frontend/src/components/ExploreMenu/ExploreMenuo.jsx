import React from 'react'
import './ExploreMenu.css'
import {menu_list} from '../../assets/assets'

const ExploreMenuo = () => {
  return (
    <div className='explore-menu' id='explore-menu'>
    <h1> Explore our menu</h1>
    <p className='explore-menu-text'>  Discover a carefully crafted menu offering a wide range of mouthwatering dishes, prepared with the finest ingredients and a dedication to culinary excellence. Our goal is to make every meal a memorable experience, filled with flavor and satisfaction. </p>
    <div className="explore-menu-list">
        {menu_list.map((item,index)=>{
            return (
                <div key={index} className="explore-menu-list-item">
                    <img src={item.menu_image} alt=""/>
                    <p> {item.menu_name}</p>
                </div>
            )
        })}
    </div>
    </div>
  )
}

export default ExploreMenuo