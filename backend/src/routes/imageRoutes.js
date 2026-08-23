const express = require("express");

const router = express.Router();

const upload = require("../config/multer");

const {
    createImage,
    getImages,
} = require("../controllers/imageController");

const { verifyImage } = require("../controllers/verifyController");

// Verify image
router.post("/verify", upload.single("image"), verifyImage);

// Register image
router.post("/", upload.single("image"), createImage);

// Get all registered images
router.get("/", getImages);

module.exports = router;