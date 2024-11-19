/*
    This file contains the schema for the cart collection in the database.

    Table Cart{
      id serial [pk]
      consumerId string
      totalPrice float
      totalItem integer
    }
*/

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CartSchema = new Schema(
  {
    consumerId: {
      type: String,
      required: true,
    },
    totalItem: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: mongoose.Types.Decimal128,
      default: 0,
    },
    items:{
      type: [String],
    }
  },
  {
    versionKey: false,
    timestamps: {createdAt: false, updatedAt: true},
    collection: "Cart",
  }
);

const Cart = model("Cart", CartSchema);
module.exports = Cart;
