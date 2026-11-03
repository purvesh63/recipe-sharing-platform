const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  ingredients: [{ type: String, trim: true }],
  instructions: { type: String, required: true, trim: true },
  imageUrl: { type: String, trim: true, default: "" },
  prepTime: { type: Number, min: 0, default: 0 },
  category: { type: String, trim: true, default: "Other" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }]
}, { timestamps: true });

module.exports = mongoose.model("Recipe", recipeSchema);
