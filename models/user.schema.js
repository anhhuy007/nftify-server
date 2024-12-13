/*
  This file contains the schema for the user information in the database.

  Table User {
    id string [pk]
    name varchar
    description string
    avatarUrl string
    gender varchar
    status string [note: "field: pending, verified, rejected"]
  }
*/

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    avatarUrl: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "unknown"],
      default: "unknown",
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    wallet_address: {
      type: String,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "User",
  }
);
const User = model("User", UserSchema);
module.exports = User;
