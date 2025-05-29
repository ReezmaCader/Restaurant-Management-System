import React, { useState } from 'react';
import './AdminDashboard.css';
import { assets } from '../../assets/assets';
import Dashboard from '../../components/Admin/Dashboard';
import AddItem from '../../components/Admin/AddItem';
import FoodList from '../../components/Admin/FoodList';
import EditItem from '../../components/Admin/EditItem';
import Orders from '../../components/Admin/Orders';
import Discount from '../../components/Admin/Discount';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingItem, setEditingItem] = useState(null);

  const handleEdit = (food) => {
    console.log('Editing item:', food);
    setEditingItem(food);
    setActiveTab('edit-item');
  };

  const handleBackFromEdit = () => {
    console.log('Going back from edit');
    setEditingItem(null);
    setActiveTab('food-list');
  };

  const handleUpdateComplete = () => {
    console.log('Update completed');
    setEditingItem(null);
    setActiveTab('food-list');
  };

  const handleTabClick = (tab) => {
    if (tab !== 'edit-item') {
      setEditingItem(null);
    }
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'add-item':
        return <AddItem />;
      case 'food-list':
        return <FoodList onEdit={handleEdit} />;
      case 'edit-item':
        return (
          <EditItem 
            item={editingItem} 
            onBack={handleBackFromEdit}
            onUpdate={handleUpdateComplete}
          />
        );
      case 'orders':
        return <Orders />;
      case 'discount':
        return <Discount />;
      default:
        return <Dashboard />;
    }
  };

  const getSidebarButtonClass = (tab) => {
    return `sidebar-btn ${activeTab === tab ? 'sidebar-btn-active' : ''}`;
  };

  return (
    <div className="admin-root">
      

      {/* Body */}
      <div className="admin-body">
        {/* Sidebar */}
        <div className="admin-sidebar">
          <button 
            className={getSidebarButtonClass('dashboard')}
            onClick={() => handleTabClick('dashboard')}
          >
            
            Dashboard
          </button>
          
          <button 
            className={getSidebarButtonClass('add-item')}
            onClick={() => handleTabClick('add-item')}
          >
            
            Add Item
          </button>
          
          <button 
            className={getSidebarButtonClass('food-list')}
            onClick={() => handleTabClick('food-list')}
          >
            
            Food List
          </button>

          {/* Show Edit Item button only when editing */}
          {editingItem && (
            <button 
              className={getSidebarButtonClass('edit-item')}
              onClick={() => handleTabClick('edit-item')}
            >
              
              Edit Item
            </button>
          )}
          
          <button 
            className={getSidebarButtonClass('orders')}
            onClick={() => handleTabClick('orders')}
          >
            
            Orders
          </button>
          
          <button 
            className={getSidebarButtonClass('discount')}
            onClick={() => handleTabClick('discount')}
          >
            
            Discounts
          </button>

          
        </div>

        {/* Content */}
        <div className="admin-content">
          {/* Breadcrumb */}
          <div className="breadcrumb">
            <span className="breadcrumb-item">Admin</span>
            {activeTab !== 'dashboard' && (
              <>
                <span className="breadcrumb-separator"> / </span>
                <span className="breadcrumb-item active">
                  {activeTab === 'add-item' && 'Add Item'}
                  {activeTab === 'food-list' && 'Food List'}
                  {activeTab === 'edit-item' && `Edit Item${editingItem ? ` - ${editingItem.name}` : ''}`}
                  {activeTab === 'orders' && 'Orders'}
                  {activeTab === 'discount' && 'Discounts'}
                </span>
              </>
            )}
          </div>

          {/* Main Content */}
          {renderContent()}
        </div>
      </div>

      
      
    </div>
  );
}

export default AdminDashboard;
