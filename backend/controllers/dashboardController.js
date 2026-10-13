const User = require("../models/User");
const LostItem = require("../models/LostItem");
const FoundItem = require("../models/FoundItem");
const Claim = require("../models/Claim");
const Notification = require("../models/Notification");

const getDashboard = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id;

    const user = await User.findById(userId).select("name email department year hostel");

    const [
      lostReports,
      foundReports,
      claims,
      approvedClaims,
      recentNotifications
    ] = await Promise.all([
      LostItem.countDocuments({ user: userId }),
      FoundItem.countDocuments({ reportedBy: userId }),
      Claim.countDocuments({ user: userId }),
      Claim.countDocuments({ user: userId, status: "approved" }),
      Notification.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    const recentActivity = recentNotifications.map((notification) => ({
      type: notification.type || "notification",
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt
    }));

    res.status(200).json({
      user: {
        name: user?.name || "Student",
        email: user?.email || "",
        department: user?.department || "",
        year: user?.year || "",
        hostel: user?.hostel || ""
      },
      stats: {
        lostReports,
        foundReports,
        potentialMatches: claims,
        returnedItems: approvedClaims
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