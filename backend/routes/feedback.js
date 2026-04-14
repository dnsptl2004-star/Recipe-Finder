import express from "express";
import Recipe from "../models/Recipe.js";

const router = express.Router();

router.post("/:id/feedbacks", async (req, res) => {
  const { rating, comment } = req.body;
  const recipeId = req.params.id;

  if (!rating || !comment) {
    return res.status(400).json({ message: "Rating and comment required" });
  }

  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const newFeedback = { rating, comment, date: new Date() };
    recipe.feedback = recipe.feedback
      ? [...recipe.feedback, newFeedback]
      : [newFeedback];

    await recipe.save();
    res.json({ success: true, feedbacks: recipe.feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
