const File = require("../models/file.model");
const { cloudinary } = require("../config/cloudinary");

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });

        // Upload buffer directly to cloudinary
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder: "cloudstore", resource_type: "auto" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                },
            );
            stream.end(req.file.buffer);
        });

        const file = await File.create({
            user: req.user.id,
            originalName: req.file.originalname,
            cloudinaryId: result.public_id,
            url: result.secure_url,
            fileType: req.file.mimetype,
            resourceType: result.resource_type, // add this line
            size: req.file.size,
        });

        res.status(201).json({ message: "File uploaded successfully", file });
    } catch (error) {
        res.status(500).json({
            message: "Upload failed",
            error: error.message,
        });
    }
};

exports.getMyFiles = async (req, res) => {
    try {
        const files = await File.find({ user: req.user.id }).sort({
            createdAt: -1,
        });
        res.status(200).json({ count: files.length, files });
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve files",
            error: error.message,
        });
    }
};

exports.getPublicFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id).select(
            "originalName url fileType resourceType size"
        );
        if (!file) return res.status(404).json({ message: "File not found" });
        res.status(200).json({ file });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve file", error: error.message });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) return res.status(404).json({ message: "File not found" });
        if (file.user.toString() !== req.user.id)
            return res.status(403).json({ message: "Unauthorized" });
        await cloudinary.uploader.destroy(file.cloudinaryId, {
            resource_type: file.resourceType, // was 'auto', now uses stored value
        });
        await file.deleteOne();
        res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete file",
            error: error.message,
        });
    }
};
