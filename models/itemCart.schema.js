/* 
    This file contains the schema for the ItemCart collection in the database.
    Description: ItemCarts model represents the item in the cart in the database.

    Table ItemCart{
      cartId string [pk]
      itemId string [pk]
      createdAt timestamp
    }
*/

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const ItemCartSchema = new Schema(
  {
    cartId: {
      type: String,
      required: true,
    },
    itemId: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "ItemCart",
  }
);

const ItemCart = model("ItemCarts", ItemCartSchema);
module.exports = ItemCart;
