const crypto = require("crypto");
const Image = require("../models/Image");
const { verifyHashOnBlockchain } = require("../services/blockchainService");

const verifyImage = async (req, res) => {
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

    // Verify on Ethereum Sepolia blockchain
    const existsOnChain = await verifyHashOnBlockchain(hash);

    // Look up in MongoDB for metadata (without exposing owner identity/email)
    const imageRecord = await Image.findOne({ hash }).select(
      "fileName fileType fileSize uploadedAt txHash hash imageUrl"
    );

    const isVerified = existsOnChain || !!imageRecord;

    return res.status(200).json({
      success: true,
      authentic: isVerified,
      status: isVerified ? "verified" : "not_found",
      title: isVerified ? "✓ Verified" : "No Matching Proof Found",
      message: isVerified
        ? "This image matches a registered ProofMint proof."
        : "No ProofMint registration matching this image was found.",
      imageHash: hash,
      proofDetails: isVerified
        ? {
            blockchain: "Ethereum Sepolia Testnet",
            txHash: imageRecord?.txHash || null,
            uploadedAt: imageRecord?.uploadedAt || null,
            fileName: imageRecord?.fileName || req.file.originalname,
            fileSize: imageRecord?.fileSize || req.file.size,
            imageUrl: imageRecord?.imageUrl || null,
          }
        : null,
      note: isVerified
        ? "Cryptographic proof confirmed on-chain."
        : "A failed match means ProofMint has no matching registered proof; it does not automatically prove that the image is unauthentic or fake.",
    });
  } catch (error) {
    console.error("Verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error during verification.",
    });
  }
};

module.exports = {
  verifyImage,
};