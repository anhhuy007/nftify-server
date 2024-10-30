const mongoose = require('mongoose');
require('mongoose')
const { Schema, model } = mongoose;
const ItemSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    issued_by: {
      type: String,
    },
    function: {
      type: String,
    },
    date: {
      type: String,
    },
    denom: {
      type: String,
    },
    color: {
      type: String,
    }
  },
  {
    versionKey: false, // This will prevent the __v field from being added
    collection: 'Items'
});
const Item = model('Item', ItemSchema);
module.exports = Item;