const MenuItem = require("../models/MenuItem");
const logger = require("../utils/Logger");

const generateNextItemId = async () => {
    try {
        logger.info("Generating next itemId");
        const lastItem = await MenuItem.findOne().sort({ itemId: -1 }).select('itemId');

        if (!lastItem) {
            logger.info("No existing item found, starting with itemId 1");
            return 1;
        }

        const nextItemId = lastItem.itemId + 1;
        logger.info("Generated next itemId");
        return nextItemId;
    } catch (error) {
        logger.error("Error generating next itemId", { error: error.message, stack: error.stack });
        throw error;
    }
};

exports.createMenuItem = async (req, res) => {
    try {
        const { name, description, price, category, image, discount = 0, freeItem = false, availability = true } = req.body;

        // Validation
        if (!name || !description || !price || !category || !image) {
            return res.status(400).json({ msg: "All required fields must be provided" });
        }

        if (price <= 0) {
            return res.status(400).json({ msg: "Price must be greater than 0" });
        }

        if (discount < 0 || discount > 100) {
            return res.status(400).json({ msg: "Discount must be between 0 and 100" });
        }

        const itemId = await generateNextItemId();
        logger.info("Attempting to create new menu item");

        const menuItem = new MenuItem({
            itemId,
            name,
            description,
            price: parseFloat(price),
            category,
            image,
            discount: parseFloat(discount),
            freeItem: Boolean(freeItem),
            availability: Boolean(availability)
        });

        await menuItem.save();
        logger.info("Menu item created successfully");
        res.status(201).json(menuItem);
    } catch (error) {
        logger.error("Error creating menu item", { error: error.message, stack: error.stack });
        res.status(500).json({ msg: "Server error" });
    }
};

exports.updateMenuItemByItemId = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { name, description, price, category, availability, image, freeItem, discount } = req.body;

        logger.info("Attempting to update menu item by itemId");

        const menuItem = await MenuItem.findOne({ itemId });
        if (!menuItem) {
            logger.error("Menu item update failed - item not found by itemId");
            return res.status(404).json({ msg: "Menu item not found" });
        }

        // Validation for price and discount
        if (price !== undefined && price <= 0) {
            return res.status(400).json({ msg: "Price must be greater than 0" });
        }

        if (discount !== undefined && (discount < 0 || discount > 100)) {
            return res.status(400).json({ msg: "Discount must be between 0 and 100" });
        }

        // Update fields
        if (name !== undefined) menuItem.name = name;
        if (description !== undefined) menuItem.description = description;
        if (price !== undefined) menuItem.price = parseFloat(price);
        if (category !== undefined) menuItem.category = category;
        if (availability !== undefined) menuItem.availability = Boolean(availability);
        if (image !== undefined) menuItem.image = image;
        if (freeItem !== undefined) menuItem.freeItem = Boolean(freeItem);
        if (discount !== undefined) menuItem.discount = parseFloat(discount);

        await menuItem.save();
        logger.info("Menu item updated successfully by itemId");
        res.status(200).json(menuItem);
    } catch (error) {
        logger.error("Error updating menu item by itemId", { error: error.message, stack: error.stack });
        res.status(500).json({ msg: "Server error" });
    }
};

exports.deleteMenuItemByItemId = async (req, res) => {
    try {
        const { itemId } = req.params;
        logger.info("Attempting to delete menu item by itemId");

        const menuItem = await MenuItem.findOne({ itemId });
        if (!menuItem) {
            logger.error("Menu item deletion failed - item not found by itemId");
            return res.status(404).json({ msg: "Menu item not found" });
        }

        await MenuItem.findOneAndDelete({ itemId });
        logger.info("Menu item deleted successfully by itemId");
        res.status(200).json({ msg: "Menu item deleted successfully" });
    } catch (error) {
        logger.error("Error deleting menu item by itemId", { error: error.message, stack: error.stack });
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getMenuItems = async (req, res) => {
    try {
        logger.info("Fetching all menu items");
        const menuItems = await MenuItem.find().lean();
        logger.info("Menu items fetched successfully");
        res.status(200).json(menuItems);
    } catch (error) {
        logger.error("Error fetching menu items", { error: error.message, stack: error.stack });
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getMenuItemByItemId = async (req, res) => {
    try {
        const { itemId } = req.params;
        logger.info("Fetching menu item by itemId");

        const menuItem = await MenuItem.findOne({ itemId });
        if (!menuItem) {
            logger.error("Menu item not found by itemId");
            return res.status(404).json({ msg: "Menu item not found" });
        }

        logger.info("Menu item fetched successfully by itemId");
        res.status(200).json(menuItem);
    } catch (error) {
        logger.error("Error fetching menu item by itemId", { error: error.message, stack: error.stack });
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getMenuItemsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        logger.info("Fetching menu items by category");

        const menuItems = await MenuItem.find({ category }).lean();
        logger.info("Menu items fetched successfully by category");
        res.status(200).json(menuItems);
    } catch (error) {
        logger.error("Error fetching menu items by category", { error: error.message, stack: error.stack });
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getAvailableMenuItems = async (req, res) => {
    try {
        logger.info("Fetching menu items by availability");

        const menuItems = await MenuItem.find({ availability: true }).lean();
        logger.info("Menu items fetched successfully by availability");
        res.status(200).json(menuItems);
    } catch (error) {
        logger.error("Error fetching menu items by availability", { error: error.message, stack: error.stack });
        res.status(500).json({ msg: "Server error" });
    }
};

exports.rateMenuItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { userId, rating } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ msg: "Rating must be between 1 and 5" });
        }

        logger.info("Attempting to rate menu item");

        const menuItem = await MenuItem.findOne({ itemId });
        if (!menuItem) {
            logger.error("Menu item not found for rating");
            return res.status(404).json({ msg: "Menu item not found" });
        }

        // Check if user already rated this item
        const existingRatingIndex = menuItem.ratings.findIndex(r => r.userId === userId);
        
        if (existingRatingIndex !== -1) {
            // Update existing rating
            menuItem.ratings[existingRatingIndex].rating = rating;
            menuItem.ratings[existingRatingIndex].createdAt = new Date();
        } else {
            // Add new rating
            menuItem.ratings.push({ userId, rating });
        }

        // Recalculate average rating
        const totalRatings = menuItem.ratings.length;
        const sumRatings = menuItem.ratings.reduce((sum, r) => sum + r.rating, 0);
        menuItem.averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;
        menuItem.totalRatings = totalRatings;

        await menuItem.save();
        logger.info("Menu item rated successfully");
        res.status(200).json(menuItem);
    } catch (error) {
        logger.error("Error rating menu item", { error: error.message, stack: error.stack });
        res.status(500).json({ msg: "Server error" });
    }
};
