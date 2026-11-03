const express = require("express");
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const Comment = require("../models/Comment");
const asyncHandler = require("../middleware/asyncHandler");
const { attachUser, requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(attachUser);

router.get("/", asyncHandler(async (req, res) => {
  const recipes = await Recipe.find()
    .populate("author", "username")
    .sort({ createdAt: -1 });
  res.render("recipeList", { title: "Discover recipes", recipes });
}));

router.get("/mine", requireAuth, asyncHandler(async (req, res) => {
  const recipes = await Recipe.find({ author: req.user._id })
    .populate("author", "username")
    .sort({ createdAt: -1 });
  res.render("myRecipes", { title: "My recipes", recipes });
}));

router.get("/new", requireAuth, (req, res) => {
  res.render("recipeForm", {
    title: "Share a recipe",
    recipe: null,
    error: null
  });
});

router.post("/", requireAuth, asyncHandler(async (req, res) => {
  const { title, description, ingredients, instructions, imageUrl, prepTime, category } = req.body;
  const ingredientList = (ingredients || "").split("\n").map(x => x.trim()).filter(Boolean);
  const recipe = await Recipe.create({
    title, description, ingredients: ingredientList, instructions, imageUrl,
    prepTime: Number(prepTime) || 0, category, author: req.user._id
  });
  await User.findByIdAndUpdate(req.user._id, { $addToSet: { recipes: recipe._id } });
  res.redirect(`/recipes/${recipe._id}`);
}));

router.get("/:id/edit", requireAuth, asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).render("error", { title: "Not found", message: "Recipe not found." });
  if (String(recipe.author) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).render("error", { title: "Access denied", message: "You cannot edit this recipe." });
  }
  res.render("recipeForm", { title: "Edit recipe", recipe, error: null });
}));

router.post("/:id/edit", requireAuth, asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).render("error", { title: "Not found", message: "Recipe not found." });
  if (String(recipe.author) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).render("error", { title: "Access denied", message: "You cannot edit this recipe." });
  }
  Object.assign(recipe, {
    title: req.body.title,
    description: req.body.description,
    ingredients: (req.body.ingredients || "").split("\n").map(x => x.trim()).filter(Boolean),
    instructions: req.body.instructions,
    imageUrl: req.body.imageUrl,
    prepTime: Number(req.body.prepTime) || 0,
    category: req.body.category
  });
  await recipe.save();
  res.redirect(`/recipes/${recipe._id}`);
}));

router.post("/:id/delete", requireAuth, asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.redirect("/recipes");
  if (String(recipe.author) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).render("error", { title: "Access denied", message: "You cannot delete this recipe." });
  }
  await Comment.deleteMany({ recipe: recipe._id });
  await User.findByIdAndUpdate(recipe.author, { $pull: { recipes: recipe._id } });
  await recipe.deleteOne();
  res.redirect("/recipes/mine");
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const recipe = await Recipe.findById(req.params.id)
    .populate("author", "username")
    .populate({ path: "comments", populate: { path: "author", select: "username" } });
  if (!recipe) return res.status(404).render("error", { title: "Not found", message: "Recipe not found." });
  res.render("recipeItem", { title: recipe.title, recipe });
}));

module.exports = router;
