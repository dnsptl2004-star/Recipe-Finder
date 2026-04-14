import express from "express";
import Recipe from "../models/Recipe.js";
import User from "../models/User.js";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ storage });

router.post("/upload/video", upload.single("video"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No video uploaded",
    });
  }

  const base64Str = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

  res.json({
    success: true,
    message: "Video uploaded",
    url: base64Str,
  });
});

router.post("/", async (req, res) => {
  const {
    userId,
    title,
    image,
    ingredients,
    instructions,
    serves,
    cuisine,
    time,
    difficulty,
    video,
    language,
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.role !== "teacher") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Only teachers can create recipes." });
    }

    const newRecipe = new Recipe({
      title,
      image,
      ingredients,
      instructions,
      serves,
      cuisine,
      time,
      difficulty,
      video, 
      language,
      createdBy: user._id,
    });

    await newRecipe.save();
    res.json({ success: true, message: "✅ Recipe created successfully", data: newRecipe });
  } catch (err) {
    res.status(500).json({ success: false, message: "🚫 Server error: " + err.message });
  }
});

router.get("/search", async (req, res) => {
  const name = req.query.name;
  try {
    const recipe = await Recipe.findOne({
      title: { $regex: new RegExp(name, "i") },
    });

    if (!recipe)
      return res.status(404).json({
        success: false,
        message: "❌ Recipe not found",
        data: null,
      });

    res.json({
      success: true,
      message: "✅ Recipe found",
      data: {
        id: recipe._id,
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        serves: recipe.serves || null,
        image: recipe.image || null,
        cuisine: recipe.cuisine || null,
        time: recipe.time || null,
        difficulty: recipe.difficulty || null,
        language: recipe.language || "en",
        video: recipe.video || "NO",
        createdBy: recipe.createdBy || null,
        feedback: recipe.feedback || [],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "🚫 Server error: " + err.message });
  }
});

router.get("/", async (req, res) => {
  const lang = req.query.lang || "en";
  try {
    const recipes = await Recipe.find({ language: lang });
    res.json({
      success: true,
      message: `✅ Recipes in '${lang}' language`,
      data: recipes,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "🚫 Server error: " + err.message });
  }
});

router.get("/list", async (req, res) => {
  const lang = req.query.lang;
  const query = lang ? { language: lang } : {};

  try {
    const recipes = await Recipe.find(query, "title");
    res.json({
      success: true,
      message: "✅ Recipe titles fetched",
      data: recipes,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "🚫 Server error: " + err.message });
  }
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Only admins can delete recipes." });
    }

    const recipe = await Recipe.findByIdAndDelete(id);
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "❌ Recipe not found",
      });
    }

    res.json({ success: true, message: "✅ Recipe deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "🚫 Server error: " + err.message });
  }
});

router.post("/:id/feedbacks", async (req, res) => {
  const { rating, comment } = req.body;
  const { id } = req.params;

  if (!rating || !comment) {
    return res.status(400).json({
      message: "⚠️ Rating and comment are required",
    });
  }

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: "❌ Recipe not found" });

    recipe.feedback.push({ rating, comment, date: new Date() });
    await recipe.save();

    res.json({
      success: true,
      message: "✅ Feedback added",
      feedbacks: recipe.feedback,
    });
  } catch (err) {
    res.status(500).json({ message: "🚫 Server error: " + err.message });
  }
});

router.get("/:id/feedbacks", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id, "feedback");
    if (!recipe)
      return res.status(404).json({
        success: false,
        message: "❌ Recipe not found",
      });

    res.json({ success: true, feedbacks: recipe.feedback });
  } catch (err) {
    res.status(500).json({ success: false, message: "🚫 Server error: " + err.message });
  }
});

router.put("/:id/feedbacks/:feedbackId", async (req, res) => {
  const { id, feedbackId } = req.params;
  const { rating, comment } = req.body;

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ message: "❌ Recipe not found" });

    const fb = recipe.feedback.id(feedbackId);
    if (!fb)
      return res.status(404).json({
        message: "❌ Feedback not found",
      });

    fb.rating = rating ?? fb.rating;
    fb.comment = comment ?? fb.comment;
    fb.date = new Date();

    await recipe.save();
    res.json({
      success: true,
      message: "✅ Feedback updated",
      feedbacks: recipe.feedback,
    });
  } catch (err) {
    res.status(500).json({ message: "🚫 Server error: " + err.message });
  }
});

router.delete("/:id/feedbacks/:feedbackId", async (req, res) => {
  const { id, feedbackId } = req.params;

  try {
    const recipe = await Recipe.findById(id);
    if (!recipe)
      return res.status(404).json({
        success: false,
        message: "❌ Recipe not found",
      });

    const fb = recipe.feedback.id(feedbackId);
    if (!fb)
      return res.status(404).json({
        success: false,
        message: "❌ Feedback not found",
      });

    fb.deleteOne();
    await recipe.save();

    res.json({
      success: true,
      message: "✅ Feedback deleted",
      feedbacks: recipe.feedback,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "🚫 Server error: " + err.message });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    userId,
    title,
    image,
    ingredients,
    instructions,
    serves,
    cuisine,
    time,
    difficulty,
    video, 
    language,
  } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.role !== "teacher") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Only teachers can update recipes." });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      id,
      {
        title,
        image,
        ingredients,
        instructions,
        serves,
        cuisine,
        time,
        difficulty,
        video,
        language,
      },
      { new: true }
    );

    if (!updatedRecipe) {
      return res.status(404).json({
        success: false,
        message: "❌ Recipe not found",
      });
    }

    res.json({
      success: true,
      message: "✅ Recipe updated successfully",
      data: updatedRecipe,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "🚫 Server error: " + err.message });
  }
});

export default router;
