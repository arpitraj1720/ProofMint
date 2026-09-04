const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Username is required"],
    trim: true,
  },
  username: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
  },
  passwordHash: {
    type: String,
    required: false,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
