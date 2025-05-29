const connectDB = require("./src/utils/Database");
const dotenv = require("dotenv");
const logger = require("./src/utils/Logger");
const app = require("./app");

dotenv.config();
connectDB();

if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}