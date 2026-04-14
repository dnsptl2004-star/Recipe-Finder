import express from "express";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import { authMiddleware } from "./auth.js";

const router = express.Router();

// Middleware to check if user is an admin
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "❌ Access denied. Admins only." });
  }
};

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// ── User Management ──

// List all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

// Update user role
router.put("/users/:id/role", async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["learner", "teacher", "admin"].includes(role)) {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  try {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "✅ Role updated successfully", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "✅ User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

// ── Recipe Management ──

// List all recipes
router.get("/recipes", async (req, res) => {
  try {
    const recipes = await Recipe.find().populate("createdBy", "username email");
    res.json({ success: true, data: recipes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

// Delete any recipe
router.delete("/recipes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const recipe = await Recipe.findByIdAndDelete(id);
    if (!recipe) return res.status(404).json({ success: false, message: "Recipe not found" });
    res.json({ success: true, message: "✅ Recipe deleted successfully by admin" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
});

export default router;
