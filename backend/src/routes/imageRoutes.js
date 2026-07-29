const express = require("express");
const router = express.Router();

const upload = require("../config/multer");

const { createImage } = require("../controllers/imageController");


router.post("/", upload.single("image"), createImage);

module.exports = router;