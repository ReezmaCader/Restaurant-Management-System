import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';

function Orders() {
  const [orderTab, setOrderTab] = useState("pending");

  return (
    <div>
      <div className="order-tabs">
        <button
          className={orderTab === "pending" ? "order-tab active" : "order-tab"}
          onClick={() => setOrderTab("pending")}
        >
          Pending Orders
        </button>
        <button
          className={orderTab === "completed" ? "order-tab active" : "order-tab"}
          onClick={() => setOrderTab("completed")}
        >
          Completed Orders
        </button>
      </div>
      {orderTab === "pending" ? <OrderPending /> : <OrderCompleted />}
    </div>
  );
}

function OrderPending() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState({});

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchMenuItemDetails = async (itemId) => {
    try {
      if (!menuItems[itemId]) {
        const menuItem = await api.getMenuItemById(itemId);
        setMenuItems(prev => ({
          ...prev,
          [itemId]: menuItem
        }));
        return menuItem;
      }
      return menuItems[itemId];
    } catch (error) {
      console.error('Error fetching menu item:', error);
      return null;
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const allOrders = await api.getOrders();
      const pendingOrders = allOrders.filter(order =>
        order.status === 'food_processing' || order.status === 'out_for_delivery'
      );
      setOrders(pendingOrders);

      // Fetch menu item details for images
      const itemIds = [...new Set(pendingOrders.flatMap(order =>
        order.items.map(item => item.itemId)
      ))];

      for (const itemId of itemIds) {
        await fetchMenuItemDetails(itemId);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      fetchPendingOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const renderItemImage = (item) => {
    const menuItem = menuItems[item.itemId];

    if (menuItem && menuItem.image) {
      return (
        <img
          src={menuItem.image}
          alt={item.name}
          className="order-item-img"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    }

    return (
      <div className="order-item-img-placeholder">
        <span>🍽️</span>
      </div>
    );
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      {orders.length === 0 ? (
        <div className="no-orders">No pending orders</div>
      ) : (
        orders.map(order => (
          <div key={order.orderId} className="order-card">
            <div className="order-main">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  {renderItemImage(item)}
                  <div className="order-item-info">
                    <div className="item-name-qty">{item.name} X {item.quantity}</div>
                    <div className="item-badges">
                      {item.freeItem && <span className="bogo-badge-cont">BOGO</span>}
                      {item.discount > 0 && <span className="discount-badge-cont">{item.discount}% OFF</span>}
                    </div>
                  </div>
                </div>
              ))}

            </div>

            <div className="order-details-con">
              <div className="order-summary">
                <div>Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)} &nbsp;&nbsp;|&nbsp;&nbsp; Rs. {order.total.toFixed(2)}</div>
                
              </div>
              <div>{order.customerInfo.firstName} {order.customerInfo.lastName}</div>
              <div>{order.customerInfo.address}</div>
              <div>{order.customerInfo.phone}</div>
              <div>{order.customerInfo.email}</div>
            </div>
            <select
              className="order-status"
              value={order.status}
              onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
            >
              <option value="food_processing">Food Processing</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        ))
      )}
    </div>
  );
}

function OrderCompleted() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState({});

  useEffect(() => {
    fetchCompletedOrders();
  }, []);

  const fetchMenuItemDetails = async (itemId) => {
    try {
      if (!menuItems[itemId]) {
        const menuItem = await api.getMenuItemById(itemId);
        setMenuItems(prev => ({
          ...prev,
          [itemId]: menuItem
        }));
        return menuItem;
      }
      return menuItems[itemId];
    } catch (error) {
      console.error('Error fetching menu item:', error);
      return null;
    }
  };

  const fetchCompletedOrders = async () => {
    try {
      const allOrders = await api.getOrders();
      const completedOrders = allOrders.filter(order => order.status === 'delivered');
      setOrders(completedOrders);

      // Fetch menu item details for images
      const itemIds = [...new Set(completedOrders.flatMap(order =>
        order.items.map(item => item.itemId)
      ))];

      for (const itemId of itemIds) {
        await fetchMenuItemDetails(itemId);
      }
    } catch (error) {
      console.error('Error fetching completed orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItemImage = (item) => {
    const menuItem = menuItems[item.itemId];

    if (menuItem && menuItem.image) {
      return (
        <img
          src={menuItem.image}
          alt={item.name}
          className="order-item-img"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      );
    }

    return (
      <div className="order-item-img-placeholder">
        <span>🍽️</span>
      </div>
    );
  };

  if (loading) return <div>Loading completed orders...</div>;

  return (
    <div>
      {orders.length === 0 ? (
        <div className="no-orders">No completed orders</div>
      ) : (
        orders.map(order => (
          <div key={order.orderId} className="order-card">
            <div className="order-main">
              {order.items.map((item, index) => (
                <div key={index} className="order-item">
                  {renderItemImage(item)}
                  <div className="order-item-info">
                    <div className="item-name-qty">{item.name} X {item.quantity}</div>
                    <div className="item-badges">
                      {item.freeItem && <span className="bogo-badge-cont">BOGO</span>}
                      {item.discount > 0 && <span className="discount-badge-cont">{item.discount}% OFF</span>}
                    </div>
                  </div>
                </div>
              ))}
              
            </div>
            <div className="order-details-con">
              <div className="order-summary">
                <div>Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)} &nbsp;&nbsp;|&nbsp;&nbsp; Rs. {order.total.toFixed(2)} &nbsp;&nbsp;|&nbsp;&nbsp; Completed</div>
                
              </div>
              <div>{order.customerInfo.firstName} {order.customerInfo.lastName}</div>
              <div>{order.customerInfo.address}</div>
              <div>{order.customerInfo.phone}</div>
              <div>Delivered on: {new Date(order.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;
export { OrderPending, OrderCompleted };
