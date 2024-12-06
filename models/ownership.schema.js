/*
  This file contains the schema for the ownership of the stamps.
  
  // illustrate item ownship
  Table Ownership {
    itemId string [pk]
    ownerId string [pk]
    createdAt timestamp
  }
*/

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const OwnershipSchema = new Schema(
  {
    itemId: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false },
    collection: "OwnerShip",
  }
);
const Ownership = model("OwnerShip", OwnershipSchema);
module.exports = Ownership;
