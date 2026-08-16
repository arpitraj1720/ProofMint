const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true,
  },

  owner: {
    type: String,
    required: true,
  },

  imageUrl: {
    type: String,
    required: true,
  },

  aiLabel: {
    type: String,
    required: true,
  },

  aiConfidence: {
    type: Number,
    required: true,
  },

  fileName: {
    type: String,
    required: true,
  },

  fileType: {
    type: String,
    required: true,
  },

  fileSize: {
    type: Number,
    required: true,
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },

  txHash: {
    type: String,
  },
  
});

const Image = mongoose.model("Image", imageSchema);

module.exports = Image;