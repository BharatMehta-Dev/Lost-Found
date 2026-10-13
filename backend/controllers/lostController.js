const LostItem = require("../models/LostItem");

// ==========================================
// CREATE LOST ITEM
// ==========================================

const createLostItem = async (req, res) => {
    try {
        const {
            itemName,
            category,
            brand,
            color,
            description,
            lostLocation,
            lostDate,
            lostTime,
            campus,
            hostel,
            image
        } = req.body;

        // Required fields
        if (
            !itemName ||
            !category ||
            !description ||
            !lostLocation ||
            !lostDate ||
            !campus
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        // Validate date
        const parsedDate = new Date(lostDate);

        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid lost date."
            });
        }

        // Create lost item
        const lostItem = await LostItem.create({
            user: req.userId,
            itemName: itemName.trim(),
            category: category.trim(),
            brand: brand ? brand.trim() : "",
            color: color ? color.trim() : "",
            description: description.trim(),
            lostLocation: lostLocation.trim(),
            lostDate: parsedDate,
            lostTime: lostTime || "",
            campus: campus.trim(),
            hostel: hostel ? hostel.trim() : "",
            image: image || "",
            status: "lost"
        });

        res.status(201).json({
            success: true,
            message: "Lost item reported successfully.",
            item: lostItem
        });

    } catch (error) {
        console.error("Create lost item error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while reporting lost item."
        });
    }
};


// ==========================================
// GET ALL LOST ITEMS
// ==========================================

const getLostItems = async (req, res) => {
    try {
        const items = await LostItem.find({
            status: "lost"
        })
            .populate("user", "name email department year hostel")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: items.length,
            items
        });

    } catch (error) {
        console.error("Get lost items error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching lost items."
        });
    }
};


// ==========================================
// GET MY LOST ITEMS
// ==========================================

const getMyLostItems = async (req, res) => {
    try {
        const items = await LostItem.find({
            user: req.userId
        })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: items.length,
            items
        });

    } catch (error) {
        console.error("Get my lost items error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching your lost items."
        });
    }
};


// ==========================================
// GET SINGLE LOST ITEM
// ==========================================

const getLostItemById = async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id)
            .populate("user", "name email department year hostel");

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Lost item not found."
            });
        }

        res.status(200).json({
            success: true,
            item
        });

    } catch (error) {
        console.error("Get lost item error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while fetching lost item."
        });
    }
};


// ==========================================
// UPDATE LOST ITEM
// ==========================================

const updateLostItem = async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Lost item not found."
            });
        }

        // Only owner can update
        if (item.user.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to update this item."
            });
        }

        const allowedFields = [
            "itemName",
            "category",
            "brand",
            "color",
            "description",
            "lostLocation",
            "lostDate",
            "lostTime",
            "campus",
            "hostel",
            "image",
            "status"
        ];

        allowedFields.forEach((field) => {
            if (req.body[field] !== undefined) {
                item[field] = req.body[field];
            }
        });

        await item.save();

        res.status(200).json({
            success: true,
            message: "Lost item updated successfully.",
            item
        });

    } catch (error) {
        console.error("Update lost item error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while updating lost item."
        });
    }
};


// ==========================================
// DELETE LOST ITEM
// ==========================================

const deleteLostItem = async (req, res) => {
    try {
        const item = await LostItem.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Lost item not found."
            });
        }

        // Only owner can delete
        if (item.user.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "You are not allowed to delete this item."
            });
        }

        await item.deleteOne();

        res.status(200).json({
            success: true,
            message: "Lost item deleted successfully."
        });

    } catch (error) {
        console.error("Delete lost item error:", error);

        res.status(500).json({
            success: false,
            message: "Server error while deleting lost item."
        });
    }
};


module.exports = {
    createLostItem,
    getLostItems,
    getMyLostItems,
    getLostItemById,
    updateLostItem,
    deleteLostItem
};