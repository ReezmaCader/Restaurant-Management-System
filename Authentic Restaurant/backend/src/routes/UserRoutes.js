const express = require("express");
const userRouter = express.Router();
const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    loginUser,
    updatePassword
} = require("../controllers/UserController");
const auth = require("../middleware/AuthMiddleware");

userRouter.post("/register", createUser);
userRouter.post("/login", loginUser);

userRouter.put("/password", auth, updatePassword);
userRouter.get("/:id", auth, getUserById);
userRouter.put("/:id", auth, updateUser);
userRouter.delete("/:id", auth, deleteUser);
userRouter.get("/", auth, getUsers);

module.exports = userRouter;
