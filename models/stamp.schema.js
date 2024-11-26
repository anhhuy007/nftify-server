/* 
    This file contains the schema for the Stamp collection in the database.
    Description: Stamp model represents the stamp in the database.

    // immutable
    Table Stamp {
      id string [pk]
      creatorId string
      title varchar(50)
      issuedBy varchar(100)
      function varchar(50)
      date date
      denom float
      color varchar(50)
      imgUrl varchar(255)
      createdAt timestamp
    }
*/

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const StampSchema = new Schema(
  {
    creatorId: {
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
      type: String,
      required: true,
    },
    denom: {
      type: mongoose.Decimal128,
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
const Item = model("Stamp", StampSchema);
module.exports = Item;
