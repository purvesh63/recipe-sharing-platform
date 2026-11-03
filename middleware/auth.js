const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function attachUser(req, res, next) {
  const token = req.cookies.token;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("_id username email role");
    if (user) {
      req.user = user;
      res.locals.currentUser = user;
    }
  } catch (error) {
    res.clearCookie("token");
  }
  next();
}

function requireAuth(req, res, next) {
  if (!req.user) return res.redirect("/login");
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.redirect("/login");
    if (!roles.includes(req.user.role)) {
      return res.status(403).render("error", {
        title: "Access denied",
        message: "You do not have permission to perform this action."
      });
    }
    next();
  };
}

module.exports = { attachUser, requireAuth, requireRole };
