console.log("APP.JS LOADED");

const express = require("express");

const app = express();

const imageRoutes = require("./routes/imageRoutes");

app.use(express.json());

app.use("/api/images", imageRoutes);

app.get("/", (req, res) => {
    res.send("Backend is running...");
});

module.exports = app;