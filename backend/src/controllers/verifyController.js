const crypto = require("crypto");
const { verifyHashOnBlockchain } = require("../services/blockchainService");

const verifyImage = async (req, res) => {
    try {
        // Make sure an image was actually uploaded
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

        const exists = await verifyHashOnBlockchain(hash);

        return res.status(200).json({
            success: true,
            authentic: exists,
            message: exists
                ? "Image is registered on the blockchain."
                : "Image is not registered on the blockchain.",
            imageHash: hash
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    verifyImage,
};