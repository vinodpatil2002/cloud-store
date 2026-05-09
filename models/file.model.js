const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        originalName: { type: String, required: true },
        cloudinaryId: { type: String, required: true },
        url: { type: String, required: true },
        fileType: { type: String },
        resourceType: { type: String, default: "image" },
        size: { type: Number },
    },
    { timestamps: true },
);

module.exports = mongoose.model("File", fileSchema);
