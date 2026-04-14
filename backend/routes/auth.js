import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import aiRoutes from "./aiRoutes.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "❌ Username or email already exists",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashed,
      role: role || "teacher",
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET || "yoursecretkey",
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      success: true,
      message: `✅ Registration successful as ${newUser.role}`,
      token,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("Registration Error:", err);
    return res.status(500).json({
      success: false,
      message: "❌ Server error during registration",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "❌ Invalid username",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "❌ Incorrect password",
      });
    }

    // Auto-convert learner to teacher if found
    if (user.role === "learner") {
      user.role = "teacher";
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "yoursecretkey",
      { expiresIn: "1h" }
    );

    res.json({
      success: true,
      message: `✅ Login successful as ${user.role}`,
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res
      .status(500)
      .json({ success: false, message: "❌ Login failed due to server error" });
  }
});

export const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, message: "❌ No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "❌ Token missing" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "yoursecretkey"
    );
    req.user = decoded;
    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: "❌ Invalid or expired token" });
  }
};


// setup-admin (one-time seed route)
router.post("/setup-admin", async (req, res) => {
  try {
    const adminEmail = "admin@gmail.com";
    const adminUser = await User.findOne({ email: adminEmail });

    if (adminUser) {
      return res.json({ success: true, message: "✅ Admin already exists" });
    }

    const hashed = await bcrypt.hash("123", 10);
    const newAdmin = new User({
      username: "admin",
      email: adminEmail,
      password: hashed,
      role: "admin",
    });

    await newAdmin.save();
    return res.status(201).json({ success: true, message: "✅ Admin seeded successfully" });
  } catch (err) {
    console.error("Setup Admin Error:", err);
    return res.status(500).json({ success: false, message: "❌ Failed to seed admin" });
  }
});

export default router;
