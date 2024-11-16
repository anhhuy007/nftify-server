/*
  This file contains the schema for the account model.
  Description: Account model represents the user account in the database.

  Table Account {
    id serial [pk]
    username varchar(255) [unique]
    email varchar(255) [unique]
    password password
    createdAt timestamp [default: `now()`]
  }
*/

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const AccountSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "Account",
  }
);

const Account = model("Account", AccountSchema);
module.exports = Account;
