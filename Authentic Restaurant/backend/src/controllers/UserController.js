const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../utils/Logger");

const generateNextUserId = async () => {
    try {
        logger.info("Generating next userId");
        const lastUser = await User.findOne().sort({ userId: -1 }).select('userId');

        if (!lastUser) {
            logger.info("No existing users found, starting with userId 1");
            return 1;
        }

        const nextUserId = lastUser.userId + 1;
        logger.info("Generated next userId");
        return nextUserId;
    } catch (error) {
        logger.error("Error generating next userId", { error: error.message, stack: error.stack });
        throw error;
    }
};

exports.createUser = async (req, res) => {
    try {
        const { name, email, password, address, phone_number, role } = req.body;

        const userId = await generateNextUserId();

        logger.info("Attempting to create new user");

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            logger.error("User creation failed - user already exists");
            return res.status(400).json({ msg: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            userId,
            name,
            email,
            password: hashedPassword,
            address,
            phone_number,
            role: role || "user"
        });

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        logger.info("User created successfully");
        res.status(201).json(userResponse);
    } catch (error) {
        logger.error("Error creating user", { error: error.message, stack: error.stack });
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getUsers = async (req, res) => {
    try {
        logger.info("Fetching all users");
        const users = await User.find().select("-password").lean();
        logger.info("Users fetched successfully");
        res.status(200).json(users);
    } catch (error) {
        logger.error("Error fetching users");
        res.status(500).json({ msg: "Server error" });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        logger.info("Fetching user by ID");

        const user = await User.findOne({ userId: id }).select("-password");
        if (!user) {
            logger.error("User not found");
            return res.status(404).json({ msg: "User not found" });
        }

        logger.info("User fetched successfully");
        res.status(200).json(user);
    } catch (error) {
        logger.error("Error fetching user");
        res.status(500).json({ msg: "Server error" });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        logger.info("Attempting to update user");

        const user = await User.findOne({ userId: id });
        if (!user) {
            logger.error("Update failed - user not found");
            return res.status(404).json({ msg: "User not found" });
        }

        const { name, email, address, phone_number } = req.body;
        const updates = {};

        if (name !== undefined) {
            user.name = name;
            updates.name = name;
        }
        if (email !== undefined) {
            user.email = email;
            updates.email = email;
        }
        if (address !== undefined) {
            user.address = address;
            updates.address = address;
        }
        if (phone_number !== undefined) {
            user.phone_number = phone_number;
            updates.phone_number = phone_number;
        }

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        logger.info("User updated successfully");
        res.status(200).json(userResponse);
    } catch (error) {
        logger.error("Error updating user");
        res.status(500).json({ msg: "Server error" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        logger.info("Attempting to delete user");

        const user = await User.findOne({ userId: id });
        if (!user) {
            logger.error("Delete failed - user not found");
            return res.status(404).json({ msg: "User not found" });
        }

        await User.findOneAndDelete({ userId: id });
        logger.info("User deleted successfully");
        res.status(200).json({ msg: "User deleted successfully" });
    } catch (error) {
        logger.error("Error deleting user");
        res.status(500).json({ msg: "Server error" });
    }
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        logger.info("User login attempt");

        const user = await User.findOne({ email });
        if (!user) {
            logger.error("Login failed - user not found");
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            logger.error("Login failed - invalid password");
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "24h" },
            (err, token) => {
                if (err) {
                    logger.error("JWT signing error");
                    throw err;
                }

                const userResponse = user.toObject();
                delete userResponse.password;

                logger.info("User logged in successfully");
                res.json({
                    token,
                    user: userResponse
                });
            }
        );
    } catch (error) {
        logger.error("Error logging in user");
        res.status(500).json({ msg: "Server error" });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        logger.info("Password update attempt");

        const user = await User.findById(req.user.id);
        if (!user) {
            logger.error("Password update failed - user not found");
            return res.status(404).json({ msg: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            logger.error("Password update failed - incorrect current password");
            return res.status(400).json({ msg: "Current password is incorrect" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        logger.info("Password updated successfully");
        res.status(200).json({ msg: "Password updated successfully" });
    } catch (error) {
        logger.error("Error updating password");
        res.status(500).json({ msg: "Server error" });
    }
};
