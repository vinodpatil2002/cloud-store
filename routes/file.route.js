const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const {
    uploadFile,
    getMyFiles,
    deleteFile,
} = require("../controllers/file.controller");

router.post("/upload", protect, upload.single("file"), uploadFile);
router.get("/", protect, getMyFiles);
router.delete("/:id", protect, deleteFile);

module.exports = router;
