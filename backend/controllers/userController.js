const { db } = require("../firebaseAdmin");

const getCurrentUser = async (req, res) => {
  try {
    const document = await db.collection("users").doc(req.user.uid).get();

    return res.json({
      success: true,
      user: {
        id: req.user.uid,
        email: req.user.email || "",
        ...(document.exists ? document.data() : {})
      }
    });
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ success: false, message: "Unable to load user profile." });
  }
};

const updateCurrentUser = async (req, res) => {
  try {
    const { name, department, year, hostel, phone } = req.body;
    const updates = { updatedAt: new Date().toISOString() };

    if (name !== undefined) updates.name = name.trim();
    if (department !== undefined) updates.department = department.trim();
    if (year !== undefined) updates.year = String(year).trim();
    if (hostel !== undefined) updates.hostel = hostel.trim();
    if (phone !== undefined) updates.phone = phone.trim();

    const userRef = db.collection("users").doc(req.user.uid);
    await userRef.set(updates, { merge: true });

    const updatedDoc = await userRef.get();
    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: req.user.uid,
        email: req.user.email || "",
        ...updatedDoc.data()
      }
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update profile.",
      details: error.message
    });
  }
};

module.exports = { getCurrentUser, updateCurrentUser };

