const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const logger = require("../utils/Logger");

const generateNextOrderId = async () => {
    try {
        const lastOrder = await Order.findOne().sort({ orderId: -1 }).select('orderId');
        if (!lastOrder) {
            return 1;
        }
        return lastOrder.orderId + 1;
    } catch (error) {
        logger.error("Error generating next orderId", { error: error.message });
        throw error;
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { userId, items, customerInfo, paymentStatus } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ msg: "Order must contain at least one item" });
        }

        const orderId = await generateNextOrderId();
        let subtotal = 0;
        let qty;
        const orderItems = [];

        // Process each item
        for (const cartItem of items) {
            const menuItem = await MenuItem.findOne({ itemId: cartItem.itemId });
            if (!menuItem || !menuItem.availability) {
                return res.status(400).json({ msg: `Item ${cartItem.itemId} is not available` });
            }

            let itemPrice = menuItem.price;

            // Apply discount
            if (menuItem.discount > 0) {
                itemPrice = itemPrice * (1 - menuItem.discount / 100);
            }

            let itemTotal;
            // Handle BOGO
            if (menuItem.freeItem) {
                const payableQuantity = Math.ceil(cartItem.quantity);
                itemTotal = itemPrice * payableQuantity;
            } else {
                itemTotal = itemPrice * cartItem.quantity;
            }

            qty = cartItem.quantity;

            if(menuItem.freeItem) {
                qty = cartItem.quantity + cartItem.quantity;
            }

            orderItems.push({
                itemId: menuItem.itemId,
                name: menuItem.name,
                price: itemPrice,
                quantity: qty,
                discount: menuItem.discount,
                freeItem: menuItem.freeItem,
                total: itemTotal
            });

            subtotal += itemTotal;
        }

        const deliveryCharge = 120;
        const total = subtotal + deliveryCharge;

        const order = new Order({
            orderId,
            userId,
            items: orderItems,
            customerInfo,
            subtotal,
            deliveryCharge,
            total,
            paymentStatus,
        });

        await order.save();
        logger.info("Order created successfully");
        res.status(201).json(order);
    } catch (error) {
        console.error("Error creating order", error);
        logger.error("Error creating order", { error: error.message });
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};

        if (status) {
            query.status = status;
        }

        const orders = await Order.find(query).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        logger.error("Error fetching orders");
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findOne({ orderId });

        if (!order) {
            return res.status(404).json({ msg: "Order not found" });
        }

        res.status(200).json(order);
    } catch (error) {
        logger.error("Error fetching order");
        res.status(500).json({ msg: "Server error" });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ msg: "Order not found" });
        }

        order.status = status;
        await order.save();

        logger.info("Order status updated successfully");
        res.status(200).json(order);
    } catch (error) {
        logger.error("Error updating order status");
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getOrdersByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const orders = await Order.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        logger.error("Error fetching user orders");
        res.status(500).json({ msg: "Server error" });
    }
};

exports.createPaymentLink = async (req, res) => {

    try {
        const { totalPrice } = req.body;
        logger.info('Creating Payment Link');

        const stripe = require('stripe')('sk_test_51RL30Q4RrwrJsL3Cd6FvKjmtNlYdaKQVRz5aXyT1ZxpfU9g8f1EjuUlI226m1qmPyygpvPcFancRe10aMJbq6R7a008XtiKRbu');

        const session = await stripe.checkout.sessions.create({
            line_items: [{
                price_data: {
                    currency: 'lkr',
                    product_data: {
                        name: 'Food Order',
                    },
                    unit_amount: Math.round(totalPrice * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            ui_mode: 'embedded',
            return_url: 'http://localhost:5173/help?session_id={CHECKOUT_SESSION_ID}&payment_intent={PAYMENT_INTENT}&redirect_status=succeeded'
        });
        res.status(200).json({ clientSecret: session.client_secret });
    } catch (error) {
        logger.error("Error Creating payment");
        res.status(500).json({ msg: "Server error" });
    }
}

exports.getDashboardAnalytics = async (req, res) => {
    try {
        const { timeRange = 'week' } = req.query;
        
        // Get all orders
        const orders = await Order.find().sort({ createdAt: -1 });
        
        // Calculate basic metrics
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const pendingOrders = orders.filter(order => 
            order.status === 'food_processing' || order.status === 'out_for_delivery'
        ).length;
        const completedOrders = orders.filter(order => order.status === 'delivered').length;
        
        // Calculate daily/weekly trends
        const now = new Date();
        const timeRanges = {
            week: 7,
            month: 30
        };
        
        const days = timeRanges[timeRange] || 7;
        const dailyData = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));
            
            const dayOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= startOfDay && orderDate <= endOfDay;
            });
            
            dailyData.push({
                date: startOfDay.toISOString().split('T')[0],
                orders: dayOrders.length,
                revenue: dayOrders.reduce((sum, order) => sum + order.total, 0)
            });
        }
        
        // Calculate top selling items
        const itemStats = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                if (itemStats[item.itemId]) {
                    itemStats[item.itemId].quantity += item.quantity;
                    itemStats[item.itemId].revenue += item.total;
                } else {
                    itemStats[item.itemId] = {
                        itemId: item.itemId,
                        name: item.name,
                        quantity: item.quantity,
                        revenue: item.total
                    };
                }
            });
        });
        
        const topItems = Object.values(itemStats)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
        
        // Recent orders
        const recentOrders = orders.slice(0, 10);
        
        const analytics = {
            summary: {
                totalOrders,
                totalRevenue,
                pendingOrders,
                completedOrders,
                averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
            },
            trends: {
                daily: dailyData
            },
            topItems,
            recentOrders
        };
        
        logger.info("Dashboard analytics fetched successfully");
        res.status(200).json(analytics);
    } catch (error) {
        logger.error("Error fetching dashboard analytics", { error: error.message });
        res.status(500).json({ msg: "Server error" });
    }
};
