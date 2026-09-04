console.log("APP.JS LOADED");

const express = require("express");
const cors = require("cors");

const app = express();

const authRoutes = require("./routes/authRoutes");
const imageRoutes = require("./routes/imageRoutes");

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/images", imageRoutes);

app.get("/", (req, res) => {
  res.send("ProofMint Backend is running...");
});

module.exports = app;