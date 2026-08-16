const express = require("express");

const router = express.Router();

const upload = require("../config/multer");

const { createImage } = require("../controllers/imageController");

const { verifyImage } = require("../controllers/verifyController");

router.post("/verify", upload.single("image"), verifyImage);

router.post("/", upload.single("image"), createImage);

module.exports = router;