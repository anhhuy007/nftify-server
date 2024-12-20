/* 
    This file contains the schema and model for the itemPricing of stamps in the database.
    Description: ItemSellPrice model represents the price of the item in the database changing over time.

    // immutable
    Table ItemSellPrice {
      itemId string [pk]
      type string
      price decimal
      createdAt timestamp
    }
*/

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const ItemPriceSchema = new Schema(
  {
    itemId: {
      type: String,
      required: true,
    },
    
    price: {
      type: mongoose.Types.Decimal128,
    },
    currency: {
      type: String,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false },
    collection: "ItemPricing",
  }
);
const ItemSellPrice = model("ItemPricing", ItemPriceSchema);
module.exports = ItemSellPrice;
