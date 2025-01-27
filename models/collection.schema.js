/* 
    This file contains the schema for the collection model.
    Description: Collection model represents set of items in the database.
    
    Table Collection {
      id string [pk]
      name varchar(255)
      description text
      ownerId id
      createdAt timestamp
      updatedAt timestamp
    }
*/

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CollectionSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    ownerId: {
      type: String,
      required: true,
    },
    items: {
      type: [String],
    },
    status: {
      type: String, 
      enum: ["selling", "sold", "displaying", "favourite"],
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    favouriteCount: {
      type: Number,
      default: 0,
    },
    thumbUrl: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "Collection",
  }
);

const collection = model("Collection", CollectionSchema);
module.exports = collection;
