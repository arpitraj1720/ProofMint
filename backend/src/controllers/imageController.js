const Image = require("../models/Image");
const crypto = require("crypto");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const {
  storeHashOnBlockchain,
  transferProofOnBlockchain,
} = require("../services/blockchainService");
const { ethers } = require("ethers");

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

const createImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided.",
      });
    }

    const hash = crypto
      .createHash("sha256")
      .update(req.file.buffer)
      .digest("hex");

    const existingImage = await Image.findOne({ hash });

    if (existingImage) {
      return res.status(409).json({
        success: false,
        message: "This image has already been uploaded and registered.",
        imageHash: hash,
      });
    }

    console.log("☁️ Starting Cloudinary upload...");
    const uploadStart = Date.now();

    const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

    console.log(
      `✅ Cloudinary upload complete in ${Date.now() - uploadStart}ms`
    );
    console.log("☁️ Cloudinary URL:", cloudinaryResult.secure_url);

    let txHash = req.body.txHash || req.body.clientTxHash;
    const registrationMode = txHash ? "self_sovereign" : "gasless";
    const signerAddress = req.body.signerAddress || null;

    if (registrationMode === "gasless") {
      console.log("⛓️ Executing Gasless Relayer blockchain transaction...");
      txHash = await storeHashOnBlockchain(hash);
      console.log("✅ Gasless Relayer transaction complete:", txHash);
    } else {
      console.log(
        `⛓️ Self-Sovereign registration with MetaMask transaction: ${txHash} (Signer: ${
          signerAddress || "User Wallet"
        })`
      );
    }

    // Assign owner strictly from authenticated user ID
    const image = new Image({
      hash,
      owner: req.user._id,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      imageUrl: cloudinaryResult.secure_url,
      txHash,
      registrationMode,
      signerAddress,
      aiLabel: "registered",
      aiConfidence: 100,
    });

    await image.save();

    return res.status(201).json({
      success: true,
      message:
        registrationMode === "self_sovereign"
          ? "Image registered successfully via MetaMask Self-Signing."
          : "Image uploaded and registered successfully via Gasless Relayer.",
      imageHash: hash,
      txHash,
      registrationMode,
      signerAddress,
      image,
    });
  } catch (error) {
    console.error("Error creating image proof:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

const getImages = async (req, res) => {
  try {
    // Filter strictly by the authenticated user's ID
    const images = await Image.find({ owner: req.user._id }).sort({
      uploadedAt: -1,
    });

    return res.status(200).json({
      success: true,
      images,
    });
  } catch (error) {
    console.error("Error fetching user images:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const transferImageOwnership = async (req, res) => {
  try {
    const { id } = req.params;
    const { newOwnerAddress } = req.body;

    if (!newOwnerAddress || !ethers.isAddress(newOwnerAddress)) {
      return res.status(400).json({
        success: false,
        message: "A valid Ethereum address (0x...) is required.",
      });
    }

    const image = await Image.findById(id);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image proof not found.",
      });
    }

    if (image.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to transfer this image proof.",
      });
    }

    console.log(
      `⛓️ Executing on-chain transfer for hash ${image.hash} to ${newOwnerAddress}...`
    );
    const transferTxHash = await transferProofOnBlockchain(
      image.hash,
      newOwnerAddress
    );
    console.log(`✅ Ownership transferred on blockchain: ${transferTxHash}`);

    image.transferredTo = newOwnerAddress;
    image.transferredAt = new Date();
    image.transferTxHash = transferTxHash;
    await image.save();

    return res.status(200).json({
      success: true,
      message: "Image proof ownership transferred successfully on-chain.",
      transferTxHash,
      image,
    });
  } catch (error) {
    console.error("Error transferring image proof:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to transfer ownership on blockchain.",
    });
  }
};

module.exports = {
  createImage,
  getImages,
  transferImageOwnership,
};