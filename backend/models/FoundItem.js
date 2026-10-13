const mongoose = require("mongoose");

const foundItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    brand: {
      type: String,
      default: ""
    },
    color: {
      type: String,
      default: ""
    },
    description: {
      type: String,
      required: true
    },
    areaType: {
      type: String,
      enum: ["campus", "hostel", "library", "canteen", "others"],
      default: "campus"
    },
    location: {
      type: String,
      required: true
    },
    dateFound: {
      type: Date,
      required: true
    },
    timeFound: {
      type: String,
      default: ""
    },
    image: {
      type: String,
      default: ""
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["active", "claimed", "resolved"],
      default: "active"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FoundItem", foundItemSchema);