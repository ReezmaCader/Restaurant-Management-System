const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderId: { type: Number, required: true, unique: true },
    userId: { type: Number, required: true },
    items: [{
        itemId: { type: Number, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        freeItem: { type: Boolean, default: false },
        total: { type: Number, required: true }
    }],
    customerInfo: {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true }
    },
    subtotal: { type: Number, required: true },
    deliveryCharge: { type: Number, required: true },
    total: { type: Number, required: true },
    status: { 
        type: String, 
        enum: ["food_processing", "out_for_delivery", "delivered"], 
        default: "food_processing" 
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
