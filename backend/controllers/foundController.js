const FoundItem = require("../models/FoundItem");
const Notification = require("../models/Notification");

const getFoundItems = async (req, res) => {
  try {
    const items = await FoundItem.find({ status: { $ne: "resolved" } })
      .sort({ createdAt: -1 })
      .populate("reportedBy", "name email department hostel");

    return res.json({
      message: "Found items loaded successfully.",
      items
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch found items.",
      error: error.message
    });
  }
};

const getFoundItemById = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id).populate(
      "reportedBy",
      "name email department hostel"
    );

    if (!item) {
      return res.status(404).json({ message: "Found item not found." });
    }

    return res.json({ item });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch found item details.",
      error: error.message
    });
  }
};

const createFoundItem = async (req, res) => {
  try {
    const {
      itemName,
      category,
      brand,
      color,
      description,
      areaType,
      location,
      dateFound,
      timeFound
    } = req.body;

    if (!itemName || !category || !description || !areaType || !location || !dateFound) {
      return res.status(400).json({
        message: "Please fill all required fields."
      });
    }

    const imagePath = req.file
      ? `/uploads/${req.file.filename}`
      : "";

    const item = await FoundItem.create({
      itemName,
      category,
      brand: brand || "",
      color: color || "",
      description,
      areaType,
      location,
      dateFound,
      timeFound: timeFound || "",
      image: imagePath,
      reportedBy: req.user._id
    });

    await Notification.create({
      user: req.user._id,
      title: "Found item reported",
      message: `You reported a found item: ${item.itemName}`,
      type: "system"
    });

    return res.status(201).json({
      message: "Found item reported successfully.",
      item
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create found item.",
      error: error.message
    });
  }
};

module.exports = {
  createFoundItem,
  getFoundItems,
  getFoundItemById
};