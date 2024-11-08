// Table ItemCollection{
//     collectionId integer [pk] 
//     item_id integer [pk]
//   }

const mongoose = require('mongoose');
require('mongoose')
const { Schema, model } = mongoose;
const itemCollectionSchema = new mongoose.Schema({
    collectionId: {
      type: String,
      required: true,
    },
    itemId: {
      type: String,
      required: true
    },
  },
  {
    versionKey: false, // This will prevent the __v field from being added
    // collection: 'Items'
    collection: 'ItemCollections'
});
const ItemCollection = model('ItemCollections', itemCollectionSchema);
module.exports = ItemCollection;