const { db } = require("../firebaseAdmin");

const foundItems = db.collection("foundItems");

const getFoundItems = async (req, res) => {
  try {
    const snapshot = await foundItems.get();
    const items = snapshot.docs
      .map((document) => ({ id: document.id, ...document.data() }))
      .filter((item) => item.status !== "resolved")
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt));

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
    const document = await foundItems.doc(req.params.id).get();

    if (!document.exists) {
      return res.status(404).json({ message: "Found item not found." });
    }

    return res.json({ item: { id: document.id, ...document.data() } });
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
      timeFound,
      image
    } = req.body;

    if (!itemName || !category || !description || !areaType || !location || !dateFound) {
      return res.status(400).json({
        message: "Please fill all required fields."
      });
    }

    const item = {
      itemName: itemName.trim(),
      category: category.trim(),
      brand: brand?.trim() || "",
      color: color?.trim() || "",
      description: description.trim(),
      areaType,
      location: location.trim(),
      dateFound,
      timeFound: timeFound || "",
      image: image || "",
      reportedBy: req.user.uid,
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const document = await foundItems.add(item);

    return res.status(201).json({
      message: "Found item reported successfully.",
      item: { id: document.id, ...item }
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