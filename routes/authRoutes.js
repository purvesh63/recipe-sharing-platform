const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { attachUser, requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(attachUser);

router.get("/register", (req, res) => {
  if (req.user) return res.redirect("/recipes");
  res.render("register", { title: "Create account", error: null });
});

router.post("/register", asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password || password.length < 6) {
    return res.status(400).render("register", {
      title: "Create account",
      error: "Enter all fields. Password must be at least 6 characters."
    });
  }
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    return res.status(409).render("register", { title: "Create account", error: "That email is already registered." });
  }
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({ username, email, password: hashedPassword });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.cookie("token", token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000
  });
  res.redirect("/recipes");
}));

router.get("/login", (req, res) => {
  if (req.user) return res.redirect("/recipes");
  res.render("login", { title: "Welcome back", error: null });
});

router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || "").toLowerCase().trim() });
  const valid = user && await bcrypt.compare(password || "", user.password);
  if (!valid) {
    return res.status(401).render("login", { title: "Welcome back", error: "Email or password is incorrect." });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.cookie("token", token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    maxAge: 24 * 60 * 60 * 1000
  });
  res.redirect("/recipes");
}));

router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production"
  });
  res.redirect("/login");
});

router.get("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production"
  });
  res.redirect("/login");
});

module.exports = router;
