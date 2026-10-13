const crypto = require("crypto");
const Image = require("../models/Image");
const { getProofOnBlockchain } = require("../services/blockchainService");

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

    // Verify and retrieve rich on-chain provenance from Ethereum Sepolia smart contract
    const onChainProof = await getProofOnBlockchain(hash);
    const existsOnChain = Boolean(onChainProof?.exists);

    // Look up in MongoDB for media details
    const imageRecord = await Image.findOne({ hash }).select(
      "fileName fileType fileSize uploadedAt txHash hash imageUrl"
    );

    const isVerified = existsOnChain || Boolean(imageRecord);

    const uploadedAt =
      onChainProof?.timestamp && onChainProof.timestamp > 0
        ? new Date(onChainProof.timestamp * 1000).toISOString()
        : imageRecord?.uploadedAt || null;

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
            uploadedAt,
            blockNumber: onChainProof?.blockNumber || null,
            registrant: onChainProof?.registrant || null,
            currentOwner: onChainProof?.currentOwner || null,
            fileName: imageRecord?.fileName || req.file.originalname,
            fileSize: imageRecord?.fileSize || req.file.size,
            imageUrl: imageRecord?.imageUrl || null,
          }
        : null,
      note: isVerified
        ? "Cryptographic proof confirmed on-chain with immutable block timestamp."
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