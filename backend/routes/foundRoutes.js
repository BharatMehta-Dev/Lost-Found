const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createFoundItem,
  getFoundItems,
  getFoundItemById
} = require("../controllers/foundController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.use(protect);

router
  .route("/")
  .get(getFoundItems)
  .post(upload.single("image"), createFoundItem);

router.route("/:id").get(getFoundItemById);

module.exports = router;