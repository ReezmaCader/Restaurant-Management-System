const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    phone_number: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
});

module.exports = mongoose.model('User', UserSchema);