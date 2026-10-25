const { db } = require("../firebaseAdmin");

const lostItems = db.collection("lostItems");

const toItem = (document) => ({ id: document.id, ...document.data() });

const createLostItem = async (req, res) => {
  try {
    const { itemName, category, brand, color, description, lostLocation, lostDate, lostTime, campus, hostel, image, privateDetails } = req.body;
    if (!itemName || !category || !description || !lostLocation || !lostDate || !campus) {
      return res.status(400).json({ success: false, message: "Please fill all required fields." });
    }
    if (Number.isNaN(new Date(lostDate).getTime())) {
      return res.status(400).json({ success: false, message: "Invalid lost date." });
    }
    const now = new Date().toISOString();
    const item = {
      userId: req.user.uid,
      itemName: itemName.trim(),
      category: category.trim(),
      brand: brand?.trim() || "",
      color: color?.trim() || "",
      description: description.trim(),
      lostLocation: lostLocation.trim(),
      lostDate,
      lostTime: lostTime || "",
      campus: campus.trim(),
      hostel: hostel?.trim() || "",
      image: image || "",
      privateDetails: privateDetails?.trim() || "",
      status: "lost",
      createdAt: now,
      updatedAt: now
    };
    const document = await lostItems.add(item);
    return res.status(201).json({ success: true, message: "Lost item reported successfully.", item: { id: document.id, ...item } });
  } catch (error) {
    console.error("Create lost item error:", error);
    return res.status(500).json({ success: false, message: "Server error while reporting lost item.", details: process.env.NODE_ENV === "production" ? undefined : error.message });
  }
};

const getLostItems = async (req, res) => {
  try {
    const snapshot = await lostItems.where("status", "==", "lost").get();
    const items = snapshot.docs.map(toItem).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return res.json({ success: true, count: items.length, items });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching lost items.", details: error.message });
  }
};

const getMyLostItems = async (req, res) => {
  try {
    const snapshot = await lostItems.where("userId", "==", req.user.uid).get();
    const items = snapshot.docs.map(toItem).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return res.json({ success: true, count: items.length, items });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching your lost items.", details: error.message });
  }
};

const getLostItemById = async (req, res) => {
  try {
    const document = await lostItems.doc(req.params.id).get();
    if (!document.exists) return res.status(404).json({ success: false, message: "Lost item not found." });
    return res.json({ success: true, item: toItem(document) });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while fetching lost item.", details: error.message });
  }
};

const updateLostItem = async (req, res) => {
  try {
    const reference = lostItems.doc(req.params.id);
    const document = await reference.get();
    if (!document.exists) return res.status(404).json({ success: false, message: "Lost item not found." });
    if (document.data().userId !== req.user.uid) return res.status(403).json({ success: false, message: "You are not allowed to update this item." });

    const fields = ["itemName", "category", "brand", "color", "description", "lostLocation", "lostDate", "lostTime", "campus", "hostel", "image", "privateDetails", "status"];
    const updates = Object.fromEntries(fields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    updates.updatedAt = new Date().toISOString();
    await reference.update(updates);
    return res.json({ success: true, message: "Lost item updated successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while updating lost item.", details: error.message });
  }
};

const deleteLostItem = async (req, res) => {
  try {
    const reference = lostItems.doc(req.params.id);
    const document = await reference.get();
    if (!document.exists) return res.status(404).json({ success: false, message: "Lost item not found." });
    if (document.data().userId !== req.user.uid) return res.status(403).json({ success: false, message: "You are not allowed to delete this item." });
    await reference.delete();
    return res.json({ success: true, message: "Lost item deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error while deleting lost item.", details: error.message });
  }
};

module.exports = { createLostItem, getLostItems, getMyLostItems, getLostItemById, updateLostItem, deleteLostItem };
