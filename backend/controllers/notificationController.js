const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return res.json({ notifications });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch notifications.",
      error: error.message
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      isRead: false
    });

    return res.json({ count });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch unread notification count.",
      error: error.message
    });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    notification.isRead = true;
    await notification.save();

    return res.json({
      message: "Notification marked as read."
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to mark notification as read.",
      error: error.message
    });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, isRead: false },
      { isRead: true }
    );

    return res.json({ message: "All notifications marked as read." });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to mark all notifications as read.",
      error: error.message
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead
};