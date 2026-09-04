const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const authMiddleware = require("../middlewares/authMiddleware");

const {
  createImage,
  getImages,
} = require("../controllers/imageController");

const { verifyImage } = require("../controllers/verifyController");

// Public image verification (No authentication required)
router.post("/verify", upload.single("image"), verifyImage);

// Protected image registration (Authentication required)
router.post("/", authMiddleware, upload.single("image"), createImage);

// Protected image listing (Authentication required - returns only current user's images)
router.get("/", authMiddleware, getImages);

module.exports = router;