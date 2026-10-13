const mongoose = require("mongoose");

const lostItemSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        itemName: {
            type: String,
            required: [true, "Item name is required"],
            trim: true,
            maxlength: 100
        },

        category: {
            type: String,
            required: [true, "Category is required"],
            trim: true
        },

        brand: {
            type: String,
            trim: true,
            default: ""
        },

        color: {
            type: String,
            trim: true,
            default: ""
        },

        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
            maxlength: 1000
        },

        lostLocation: {
            type: String,
            required: [true, "Lost location is required"],
            trim: true
        },

        lostDate: {
            type: Date,
            required: [true, "Lost date is required"]
        },

        lostTime: {
            type: String,
            default: ""
        },

        campus: {
            type: String,
            required: [true, "Campus is required"],
            trim: true
        },

        hostel: {
            type: String,
            trim: true,
            default: ""
        },

        image: {
            type: String,
            default: ""
        },

        status: {
            type: String,
            enum: ["lost", "matched", "found", "claimed", "closed"],
            default: "lost"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("LostItem", lostItemSchema);