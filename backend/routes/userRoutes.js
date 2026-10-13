const express = require("express");

const {
    getCurrentUser
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/users/me
router.get("/me", protect, getCurrentUser);

module.exports = router;