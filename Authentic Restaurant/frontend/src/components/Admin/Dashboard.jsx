import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import '../../styles/Dashboard.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Header from '../../components/Header/Header';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    dailyOrders: [],
    weeklyOrders: [],
    topItems: [],
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // 'week' or 'month'

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const orders = await api.getOrders();
      const menuItems = await api.getMenuItems();
      
      // Calculate dashboard metrics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = orders.filter(order => 
        order.status === 'food_processing' || order.status === 'out_for_delivery'
      ).length;
      const completedOrders = orders.filter(order => order.status === 'delivered').length;

      // Get daily orders for the last 7 days
      const dailyOrders = getDailyOrdersData(orders, 7);
      
      // Get weekly orders for the last 4 weeks
      const weeklyOrders = getWeeklyOrdersData(orders, 4);

      // Get top selling items
      const topItems = getTopSellingItems(orders, menuItems);

      // Get recent orders (last 5)
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setDashboardData({
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
        dailyOrders,
        weeklyOrders,
        topItems,
        recentOrders
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDailyOrdersData = (orders, days) => {
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(order => 
        order.createdAt.split('T')[0] === dateStr
      );
      
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + order.total, 0)
      });
    }
    return data;
  };

  const getWeeklyOrdersData = (orders, weeks) => {
    const data = [];
    for (let i = weeks - 1; i >= 0; i--) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (i * 7));
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
      
      const weekOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= startDate && orderDate <= endDate;
      });
      
      data.push({
        week: `Week ${weeks - i}`,
        orders: weekOrders.length,
        revenue: weekOrders.reduce((sum, order) => sum + order.total, 0)
      });
    }
    return data;
  };

  const getTopSellingItems = (orders, menuItems) => {
    const itemCounts = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (itemCounts[item.itemId]) {
          itemCounts[item.itemId].quantity += item.quantity;
          itemCounts[item.itemId].revenue += item.total;
        } else {
          itemCounts[item.itemId] = {
            name: item.name,
            quantity: item.quantity,
            revenue: item.total
          };
        }
      });
    });

    return Object.values(itemCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  };

 const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1, 
        callback: function (value) {
          return Number.isInteger(value) ? value : null;
        },
      },
    },
  },
};

  const dailyChartData = {
    labels: dashboardData.dailyOrders.map(d => d.date),
    datasets: [
      {
        label: 'Orders',
        data: dashboardData.dailyOrders.map(d => d.orders),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const weeklyChartData = {
    labels: dashboardData.weeklyOrders.map(d => d.week),
    datasets: [
      {
        label: 'Orders',
        data: dashboardData.weeklyOrders.map(d => d.orders),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
      },
    ],
  };

  const statusChartData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [dashboardData.completedOrders, dashboardData.pendingOrders],
        backgroundColor: ['#10B981', '#F59E0B'],
        borderWidth: 0,
      },
    ],
  };

  if (loading) return <div className="dashboard-loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      {/* <Header /> */}
      <div className="dashboard-content">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card total-orders">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>Total Orders</h3>
              <p className="stat-number">{dashboardData.totalOrders}</p>
            </div>
          </div>
          
          <div className="stat-card total-revenue">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Total Revenue</h3>
              <p className="stat-number">Rs. {dashboardData.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="stat-card completed-orders">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Completed Orders</h3>
              <p className="stat-number">{dashboardData.completedOrders}</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <div className="chart-header">
              <h3>Daily Orders (Last 7 Days)</h3>
            </div>
            <Line data={dailyChartData} options={chartOptions} />
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h3>Weekly Orders (Last 4 Weeks)</h3>
            </div>
            <Bar data={weeklyChartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
