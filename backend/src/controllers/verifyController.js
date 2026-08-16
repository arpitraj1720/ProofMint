const crypto = require("crypto");
const { verifyHashOnBlockchain } = require("../services/blockchainService");

const verifyImage = async (req, res) => {
    try {
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
                : "Image is not registered on the blockchain."
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