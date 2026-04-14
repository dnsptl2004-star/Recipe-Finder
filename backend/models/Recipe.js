import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String },
    ingredients: { type: [String], required: true },
    instructions: { type: [String], required: true },
    serves: { type: String, required: true },
    cuisine: { type: String, default: "ભારતીય" },
    time: { type: String, required: true, default: "જથ્થા પર આધાર રાખે છે" },
    difficulty: { type: String, default: "સુલભ" },
    video: { type: String, default: "NO" },
    language: {
      type: String,
      enum: ["en", "gu", "ગુજરાતી", "hi"],
      default: "ગુજરાતી",
    },
    feedback: [
      {
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Recipe = mongoose.model("Recipe", recipeSchema);

export default Recipe;
