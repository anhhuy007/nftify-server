/* 
    This file contains the schema for the Stamp collection in the database.
    Description: Stamp model represents the stamp in the database.

    // immutable
    Table Stamp {
      id string [pk]
      creator string
      title varchar(50)
      issuedBy varchar(100)
      function varchar(50)
      date date
      denom varchar(20)
      color varchar(50)
      imgUrl varchar(255)
      createdAt timestamp
    }
*/

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const StampSchema = new Schema(
  {
    creator: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    issuedBy: {
      type: String,
      required: true,
    },
    function: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    denom: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    imgUrl: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false },
    collection: "Stamp",
  }
);
const Stamp = model("Stamp", StampSchema);
module.exports = Stamp;
