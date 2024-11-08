// Table ItemCart{
//     id integer [pk]
//     item_id integer [pk]
//     created_at timestamp
//   }
const mongoose = require('mongoose');
require('mongoose')
const { Schema, model } = mongoose;
const itemCartSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true,
      unique: true
    },
    itemId: {
      type: String,
      required: true,
      unique: true
    },
    createdAt: {
        type: String,
    },
  },
  {
    versionKey: false,
    collection: 'ItemCarts'
});
const ItemCart = model('ItemCarts', itemCartSchema);
module.exports = ItemCart;