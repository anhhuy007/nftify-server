// Table ItemInsight{
//     item_id integer [pk]
//     type varchar(50) [pk]
//     favorite_count integer
//     view_count integer
//   }

const mongoose = require('mongoose');
require('mongoose')
const { Schema, model } = mongoose;
const itemInsightSchema = new mongoose.Schema({
  itemId: {
      type: String,
      required: true,
      unique: true 
    },
    type: {
      type: String,
      required: true
    },
    favoriteCount: {
      type: Number,
    },
    viewCount: {
      type: Number,
    },
  },
  {
    versionKey: false, 
    collection: 'ItemInsights'
});
const ItemInsight = model('ItemInsights', itemInsightSchema);
module.exports = ItemInsight;