import React, { useContext, useEffect, useState } from 'react'
import './FoodDisplay.css'
import { StoreContext } from '../../Context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import { api } from '../../utils/api';

const FoodDisplay = ({ category }) => {
  const [food_list, setFoodList] = useState([]);
  const [loading, setLoading] = useState(true);
  console.log(food_list);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const availableItems = await api.getMenuItems();
      // Filter only available items
      //const availableItems = data.filter(item => item.availability === true);
      setFoodList(availableItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className='food-display' id='food-display'>
      <h2>Top dishes near you</h2>
      <div className='food-display-list'>
        {food_list.map((item, index) => {
          if (category === "All" || category === item.category) {
            return (
              <FoodItem 
                key={item.itemId} 
                id={item.itemId} 
                name={item.name} 
                price={item.price} 
                image={item.image}
                description={item.description}
                discount={item.discount}
                freeItem={item.freeItem}
                averageRating={item.averageRating}
                totalRatings={item.totalRatings}
                availability={item.availability}
              />
            );
          }
        })}
      </div>
    </div>
  )
}

export default FoodDisplay
