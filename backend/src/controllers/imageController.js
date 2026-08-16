const Image = require("../models/Image");

const crypto = require("crypto");

const cloudinary = require("../config/cloudinary");

const streamifier = require("streamifier");

const { storeHashOnBlockchain } = require("../services/blockchainService");

const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        streamifier
            .createReadStream(buffer)
            .pipe(stream);

    });
};
const createImage = async (req, res) => {
    try{
        const hash = crypto
        .createHash("sha256")
        .update(req.file.buffer)
        .digest("hex");

        const existingImage = await Image.findOne({
            hash,
        });
        
        if(existingImage){
            return res.status(409).json({
                success:false,
                message: "This image has already been uploaded."
            });
        }
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

        const txHash = await storeHashOnBlockchain(hash);

        const image = new Image({
            hash,
            owner: req.body.owner,
            fileName: req.file.originalname,
            fileType: req.file.mimetype,
            fileSize: req.file.size,

            imageUrl: cloudinaryResult.secure_url,

            txHash,

            aiLabel: "pending",
            aiConfidence: 0,
        });
        await image.save();

        return res.status(201).json({
            success: true,
            message: "Image uploaded successfully.",
            txHash

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
    createImage,
};