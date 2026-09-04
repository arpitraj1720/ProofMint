const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "proofmint_jwt_secret_key_2026";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization token required. Please log in.",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token missing.",
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User session not found or account removed.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Session expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }
};

module.exports = authMiddleware;
