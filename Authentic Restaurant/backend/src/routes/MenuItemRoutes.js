const express = require("express");
const menuItemRouter = express.Router();
const {
    createMenuItem,
    getMenuItems,
    getMenuItemsByCategory,
    getMenuItemByItemId,
    updateMenuItemByItemId,
    deleteMenuItemByItemId,
    rateMenuItem,
} = require("../controllers/MenuItemController");
const auth = require("../middleware/AuthMiddleware");

menuItemRouter.get("/", getMenuItems);
menuItemRouter.get("/category/:category", getMenuItemsByCategory);
menuItemRouter.get("/:itemId", getMenuItemByItemId);
menuItemRouter.post("/:itemId/rate", rateMenuItem);
menuItemRouter.post("/", auth, createMenuItem);
menuItemRouter.put("/:itemId", auth, updateMenuItemByItemId);
menuItemRouter.delete("/:itemId", auth, deleteMenuItemByItemId);

module.exports = menuItemRouter;
