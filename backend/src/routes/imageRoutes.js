const express = require("express");
const router = express.Router();

const controller = require("../controllers/imageController");

console.log(controller);

router.post("/", controller.createImage);

module.exports = router;