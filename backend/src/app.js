console.log("APP.JS LOADED");

const express = require("express");
const cors = require("cors");

const app = express();

const imageRoutes = require("./routes/imageRoutes");

app.use(cors());
app.use(express.json());

app.use("/api/images", imageRoutes);

app.get("/", (req, res) => {
    res.send("Backend is running...");
});

module.exports = app;