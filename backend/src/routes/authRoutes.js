const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { register, login, googleAuth, getMe } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.get("/me", authMiddleware, getMe);

module.exports = router;
