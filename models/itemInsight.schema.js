/* 
    This file contains the schema and model for the ItemInsight collection.
    Description: ItemInsight model represents the item insight in the database.

    Table ItemInsight {
      itemId string [pk]
      verifyStatus enum [note: "field: verified, pending, rejected"]
      favoriteCount integer [default: 0]
      viewCount integer [default: 0]
      updated_at timestamp
    }
*/

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const ItemInsightSchema = new Schema(
  {
    itemId: {
      type: String,
      required: true,
    },
    verifyStatus: {
      type: String,
      enum: ["verified", "pending", "rejected"],
      default: "pending",
    },
    favoriteCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: false, updatedAt: true },
    collection: "ItemInsight",
  }
);

const ItemInsight = model("ItemInsight", ItemInsightSchema);
module.exports = ItemInsight;
