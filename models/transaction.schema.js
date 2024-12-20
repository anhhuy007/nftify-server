/* 
    This file is used to define the schema for the transaction model.

    Table Transaction {
        id string [pk]
        sellerId string
        buyerId string
        itemId string
        price float
        fee float
        createdAt timestamp [default: `now()`]
    }
*/

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
  {
    TransactionHash: {
      type: String,
      required: true,
    },
    block: {
      type: Number,
      required: true,
    },
    sellerId: {
      type: String,
      required: true,
    },
    buyerId: {
      type: String,
      required: true,
    },
    itemId: {
      type: [String],
    },
    value: {
      type: Number,
      required: true,
    },
    transactionFee: {
      type: Number,
      required: true,
    },
    gasPrice: {
      type: Number,
      required: true,
    },
    verify_status: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false },
    collection: "Transaction",
  }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
