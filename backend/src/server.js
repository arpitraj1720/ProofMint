console.log("SERVER.JS LOADED");

require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = 3001;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
  });
};

startServer();