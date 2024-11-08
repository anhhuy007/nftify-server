// Table ItemSellPrice{
//     item_id integer [pk]
//     type varchar(50) [pk]
//     price float
//     created_at timestamp
// }
const mongoose = require('mongoose');
require('mongoose')
const { Schema, model } = mongoose;
const itemSellPriceSchema = new mongoose.Schema({
    itemId: {
      type: String,
      required: true,
      unique: true 
    },
    type: {
      type: String,
      required: true
    },
    price: {
      type: mongoose.Types.Decimal128,
    },
    createdAt: {
      type: String,
    },
  },
  {
    versionKey: false,
    collection: 'ItemSellPrices'
});
const ItemSellPrice = model('ItemSellPrices', itemSellPriceSchema);
module.exports = ItemSellPrice;