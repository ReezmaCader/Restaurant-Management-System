const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
    itemId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    discount: { type: Number, required: true, default: 0, min: 0, max: 100 },
    freeItem: { type: Boolean, required: true, default: false },
    availability: { type: Boolean, required: true, default: true },
    ratings: [{
        userId: { type: Number, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        createdAt: { type: Date, default: Date.now }
    }],
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
}, {
    timestamps: true
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
