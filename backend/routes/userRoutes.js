const express = require("express");

const {
    getCurrentUser,
    updateCurrentUser
} = require("../controllers/userController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

// GET & PUT /api/users/me
router.route("/me")
    .get(protect, getCurrentUser)
    .put(protect, updateCurrentUser);

module.exports = router;