const { db } = require("../firebaseAdmin");

const claims = db.collection("claims");
const foundItems = db.collection("foundItems");
const lostItems = db.collection("lostItems");
const notifications = db.collection("notifications");

const itemFromSnapshot = (document) => (document.exists ? { id: document.id, ...document.data() } : null);

const addNotification = async (userId, title, message, type, relatedId) => {
  await notifications.add({
    userId,
    title,
    message,
    type,
    relatedId: relatedId || null,
    isRead: false,
    createdAt: new Date().toISOString()
  });
};

const createClaim = async (req, res) => {
  try {
    const { foundItemId, lostItemId, proof, notes } = req.body;
    if (!foundItemId) return res.status(400).json({ message: "Found item ID is required." });
    if (!lostItemId) return res.status(400).json({ message: "Select the matching lost report." });

    const foundItem = itemFromSnapshot(await foundItems.doc(foundItemId).get());
    if (!foundItem) return res.status(404).json({ message: "Found item not found." });

    const lostItem = itemFromSnapshot(await lostItems.doc(lostItemId).get());
    if (!lostItem || lostItem.userId !== req.user.uid) {
      return res.status(400).json({ message: "Select one of your own lost reports." });
    }

    const existing = await claims
      .where("foundItemId", "==", foundItemId)
      .where("userId", "==", req.user.uid)
      .get();

    if (existing.docs.some((document) => ["pending", "approved"].includes(document.data().status))) {
      return res.status(400).json({ message: "You already have a claim pending for this item." });
    }

    const claimData = {
      foundItemId,
      lostItemId,
      userId: req.user.uid,
      status: "pending",
      proof: proof || "",
      notes: notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const document = await claims.add(claimData);
    await addNotification(req.user.uid, "Claim submitted", `Your claim for ${foundItem.itemName} has been submitted.`, "claim", document.id);

    return res.status(201).json({ message: "Claim submitted successfully.", claim: { id: document.id, ...claimData, foundItem } });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create claim.", error: error.message });
  }
};

const getClaims = async (req, res) => {
  try {
    const snapshot = await claims.where("userId", "==", req.user.uid).get();
    const result = await Promise.all(snapshot.docs.map(async (document) => {
      const claim = { id: document.id, ...document.data() };
      claim.foundItem = itemFromSnapshot(await foundItems.doc(claim.foundItemId).get());
      return claim;
    }));
    return res.json({ claims: result.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch claims.", error: error.message });
  }
};

const getVerificationRequests = async (req, res) => {
  try {
    const snapshot = await claims.where("status", "==", "pending").get();
    const requests = await Promise.all(snapshot.docs.map(async (document) => {
      const claim = { id: document.id, ...document.data() };
      claim.foundItem = itemFromSnapshot(await foundItems.doc(claim.foundItemId).get());
      return claim;
    }));
    return res.json({ requests });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch verification requests.", error: error.message });
  }
};

const updateClaimStatus = async (req, res, status) => {
  const reference = claims.doc(req.params.id);
  const document = await reference.get();
  if (!document.exists) return res.status(404).json({ message: "Claim not found." });

  const claim = document.data();
  const foundItem = itemFromSnapshot(await foundItems.doc(claim.foundItemId).get());
  if (!foundItem) return res.status(404).json({ message: "Found item not found." });

  await reference.update({ status, updatedAt: new Date().toISOString() });
  if (status === "approved") {
    await foundItems.doc(claim.foundItemId).delete();

    if (claim.lostItemId) {
      await db.collection("lostItems").doc(claim.lostItemId).delete();
    }
  }

  await addNotification(
    claim.userId,
    `Claim ${status}`,
    `Your claim for ${foundItem.itemName} has been ${status}.`,
    status === "approved" ? "approved" : "rejected",
    req.params.id
  );

  return res.json({ message: `Claim ${status} successfully.` });
};

const approveClaim = async (req, res) => {
  try { return await updateClaimStatus(req, res, "approved"); }
  catch (error) { return res.status(500).json({ message: "Failed to approve claim.", error: error.message }); }
};

const rejectClaim = async (req, res) => {
  try { return await updateClaimStatus(req, res, "rejected"); }
  catch (error) { return res.status(500).json({ message: "Failed to reject claim.", error: error.message }); }
};

module.exports = { createClaim, getClaims, getVerificationRequests, approveClaim, rejectClaim };
