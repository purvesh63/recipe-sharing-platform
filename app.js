require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const recipeRoutes = require("./routes/recipeRoutes");
const commentRoutes = require("./routes/commentRoutes");

const app = express();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");

    app.listen(3000, () => {
      console.log("Server running on port 3000");
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed:", err.message);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.currentUser = null;
  res.locals.currentPath = req.path;
  next();
});

app.get("/", (req, res) => res.redirect("/recipes"));
app.use("/", authRoutes);
app.use("/recipes", recipeRoutes);
app.use("/comments", commentRoutes);

app.use((req, res) => {
  res.status(404).render("error", {
    title: "Page not found",
    message: "We couldn't find that page."
  });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).render("error", {
    title: "Something went wrong",
    message: process.env.NODE_ENV === "development" ? err.message : "Please try again."
  });
});

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
  })
  .catch((err) => {
    console.log("MongoDB connection failed:", err.message);
  });
