const mongoose = require('mongoose');
const logger = require("./Logger");

mongoose.set('strictQuery', false);
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logger.info("MongoDB Connected...");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }
};
module.exports = connectDB;