/* 
    This file contains the schema for the ItemCollection model
    Description: ItemCollection model represents the item in the collection in the database.

    Table ItemCollection {
      collectionId string [pk] 
      itemId string [pk]
    }
*/

const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const ItemCollectionSchema = new Schema(
  {
    collectionId: {
      type: String,
      required: true,
    },
    itemId: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false, // This will prevent the __v field from being added
    collection: "ItemCollection",
  }
);
const ItemCollection = model("ItemCollection", ItemCollectionSchema);
module.exports = ItemCollection;
