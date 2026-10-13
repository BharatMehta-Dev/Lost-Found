const Claim = require("../models/Claim");
const FoundItem = require("../models/FoundItem");
const Notification = require("../models/Notification");

const createClaim = async (req, res) => {
  try {
    const { foundItemId, proof, notes } = req.body;

    if (!foundItemId) {
      return res.status(400).json({ message: "Found item ID is required." });
    }

    const foundItem = await FoundItem.findById(foundItemId);
    if (!foundItem) {
      return res.status(404).json({ message: "Found item not found." });
    }

    const existingClaim = await Claim.findOne({
      foundItem: foundItemId,
      user: req.user._id,
      status: { $in: ["pending", "approved"] }
    });

    if (existingClaim) {
      return res.status(400).json({
        message: "You already have a claim pending for this item."
      });
    }

    const claim = await Claim.create({
      foundItem: foundItemId,
      user: req.user._id,
      proof: proof || "",
      notes: notes || ""
    });

    await Notification.create({
      user: req.user._id,
      title: "Claim submitted",
      message: `Your claim for ${foundItem.itemName} has been submitted.`,
      type: "claim",
      relatedId: claim._id
    });

    return res.status(201).json({
      message: "Claim submitted successfully.",
      claim
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create claim.",
      error: error.message
    });
  }
};

const getClaims = async (req, res) => {
  try {
    const claims = await Claim.find({ user: req.user._id })
      .populate("foundItem", "itemName category location image")
      .sort({ createdAt: -1 });

    return res.json({ claims });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch claims.",
      error: error.message
    });
  }
};

const getVerificationRequests = async (req, res) => {
  try {
    const claims = await Claim.find({ status: "pending" })
      .populate("foundItem", "itemName category location image")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return res.json({ requests: claims });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch verification requests.",
      error: error.message
    });
  }
};

const approveClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate("foundItem").populate("user");

    if (!claim) {
      return res.status(404).json({ message: "Claim not found." });
    }

    claim.status = "approved";
    await claim.save();

    await FoundItem.findByIdAndUpdate(claim.foundItem._id, {
      status: "claimed"
    });

    await Notification.create({
      user: claim.user._id,
      title: "Claim approved",
      message: `Your claim for ${claim.foundItem.itemName} has been approved.`,
      type: "approved",
      relatedId: claim._id
    });

    return res.json({ message: "Claim approved successfully." });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to approve claim.",
      error: error.message
    });
  }
};

const rejectClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate("foundItem").populate("user");

    if (!claim) {
      return res.status(404).json({ message: "Claim not found." });
    }

    claim.status = "rejected";
    await claim.save();

    await Notification.create({
      user: claim.user._id,
      title: "Claim rejected",
      message: `Your claim for ${claim.foundItem.itemName} was rejected.`,
      type: "rejected",
      relatedId: claim._id
    });

    return res.json({ message: "Claim rejected." });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to reject claim.",
      error: error.message
    });
  }
};

module.exports = {
  createClaim,
  getClaims,
  getVerificationRequests,
  approveClaim,
  rejectClaim
};