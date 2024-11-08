const mongoose = require('mongoose');
require('mongoose')
const { Schema, model } = mongoose;
const itemSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true,
      unique: true // Ensure uniqueness of your custom ID
    },
    url: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    issuedBy: {
      type: String,
    },
    function: {
      type: String,
    },
    date: {
      type: String,
    },
    denom: {
      type: mongoose.Types.Decimal128,
    },
    color: {
      type: String,
    }
  },
  {
    versionKey: false, // This will prevent the __v field from being added
    // collection: 'Items'
    collection: 'Items'
});
const Item = model('Items', itemSchema);
module.exports = Item;