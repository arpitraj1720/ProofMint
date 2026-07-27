const Image = require("../models/Image");

const createImage = async (req, res) => {
    console.log(req.body);

    res.json({
        message: "Image request received",
    });
};

module.exports = {
    createImage,
};