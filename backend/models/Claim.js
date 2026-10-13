const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    foundItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoundItem",
      required: true
    },
    lostItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LostItem",
      default: null
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "resolved"],
      default: "pending"
    },
    proof: {
      type: String,
      default: ""
    },
    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", claimSchema);