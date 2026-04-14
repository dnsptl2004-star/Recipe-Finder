import express from "express";
import multer from "multer";

const router = express.Router();

const storage = multer.memoryStorage();

const videoUpload = multer({ storage });

router.post("/video", videoUpload.single("video"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No video file uploaded" });
    }

    const fileUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    res.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error uploading video" });
  }
});

const imageUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

router.post("/image", imageUpload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file uploaded" });
    }

    const fileUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    res.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error uploading image" });
  }
});

export default router;
