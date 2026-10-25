const { db } = require("../firebaseAdmin");

const notifications = db.collection("notifications");

const listForUser = async (userId) => {
  const snapshot = await notifications.where("userId", "==", userId).get();
  return snapshot.docs
    .map((document) => ({ id: document.id, ...document.data() }))
    .sort((first, second) => String(second.createdAt || "").localeCompare(String(first.createdAt || "")));
};

const getNotifications = async (req, res) => {
  try {
    return res.json({ notifications: await listForUser(req.user.uid) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch notifications.", error: error.message });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const items = await listForUser(req.user.uid);
    return res.json({ count: items.filter((item) => !item.isRead).length });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch unread notification count.", error: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const reference = notifications.doc(req.params.id);
    const document = await reference.get();
    if (!document.exists || document.data().userId !== req.user.uid) {
      return res.status(404).json({ message: "Notification not found." });
    }
    await reference.update({ isRead: true });
    return res.json({ message: "Notification marked as read." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to mark notification as read.", error: error.message });
  }
};

const markAllNotificationsRead = async (req, res) => {
  try {
    const items = await listForUser(req.user.uid);
    const batch = db.batch();
    items.filter((item) => !item.isRead).forEach((item) => batch.update(notifications.doc(item.id), { isRead: true }));
    await batch.commit();
    return res.json({ message: "All notifications marked as read." });
  } catch (error) {
    return res.status(500).json({ message: "Unable to mark all notifications as read.", error: error.message });
  }
};

module.exports = { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead };
