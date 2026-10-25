const { db } = require("../firebaseAdmin");

const documentsForUser = async (collectionName, field, userId) => {
  const snapshot = await db
    .collection(collectionName)
    .where(field, "==", userId)
    .get();

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data()
  }));
};

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.uid;
    const profileSnapshot = await db.collection("users").doc(userId).get();
    const profile = profileSnapshot.exists ? profileSnapshot.data() : {};

    const [lostItems, foundItems, claims, notifications] = await Promise.all([
      documentsForUser("lostItems", "userId", userId),
      documentsForUser("foundItems", "reportedBy", userId),
      documentsForUser("claims", "userId", userId),
      documentsForUser("notifications", "userId", userId)
    ]);

    const recentActivity = notifications
      .sort((first, second) => String(second.createdAt || "").localeCompare(String(first.createdAt || "")))
      .slice(0, 10)
      .map((notification) => ({
        type: notification.type || "notification",
        title: notification.title || "Notification",
        message: notification.message || "",
        createdAt: notification.createdAt || ""
      }));

    res.status(200).json({
      user: {
        name: profile.name || "Student",
        email: profile.email || req.user.email || "",
        department: profile.department || "",
        year: profile.year || "",
        hostel: profile.hostel || ""
      },
      stats: {
        lostReports: lostItems.length,
        foundReports: foundItems.length,
        potentialMatches: claims.length,
        returnedItems: claims.filter((claim) => claim.status === "approved").length
      },
      recentActivity
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    res.status(500).json({
      message: "Unable to load dashboard.",
      error: error.message
    });
  }
};

module.exports = {
  getDashboard
};