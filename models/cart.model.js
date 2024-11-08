// Table Cart{
//     id integer [pk]
//     consumer_id integer
//   }

const mongoose = require('mongoose');
require('mongoose')
const { Schema, model } = mongoose;
const cartSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true,
      unique: true
    },
    consumerId: {
      type: String,
      required: true
    }
  },
  {
    versionKey: false,
    collection: 'Carts'
});
const Cart = model('Carts', cartSchema);
module.exports = Cart;