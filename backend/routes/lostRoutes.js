const express = require("express");

const {
    createLostItem,
    getLostItems,
    getMyLostItems,
    getLostItemById,
    updateLostItem,
    deleteLostItem
} = require("../controllers/lostController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create lost item
router.post("/", protect, createLostItem);

// Get all active lost items
router.get("/", protect, getLostItems);

// Get current user's lost items
router.get("/my", protect, getMyLostItems);

// Get one lost item
router.get("/:id", protect, getLostItemById);

// Update lost item
router.put("/:id", protect, updateLostItem);

// Delete lost item
router.delete("/:id", protect, deleteLostItem);


module.exports = router;