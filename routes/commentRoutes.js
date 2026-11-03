const express = require("express");
const Comment = require("../models/Comment");
const Recipe = require("../models/Recipe");
const asyncHandler = require("../middleware/asyncHandler");
const { attachUser, requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(attachUser);

router.post("/:recipeId", requireAuth, asyncHandler(async (req, res) => {
  const text = (req.body.text || "").trim();
  const recipe = await Recipe.findById(req.params.recipeId);
  if (!recipe) return res.status(404).render("error", { title: "Not found", message: "Recipe not found." });
  if (!text || text.length > 500) return res.redirect(`/recipes/${recipe._id}`);
  const comment = await Comment.create({ text, author: req.user._id, recipe: recipe._id });
  recipe.comments.push(comment._id);
  await recipe.save();
  res.redirect(`/recipes/${recipe._id}`);
}));

router.post("/:commentId/delete", requireAuth, asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) return res.redirect("/recipes");
  const recipeId = comment.recipe;
  if (String(comment.author) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).render("error", { title: "Access denied", message: "You cannot delete this comment." });
  }
  await Recipe.findByIdAndUpdate(recipeId, { $pull: { comments: comment._id } });
  await comment.deleteOne();
  res.redirect(`/recipes/${recipeId}`);
}));

module.exports = router;
