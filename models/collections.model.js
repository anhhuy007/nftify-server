// Table Collection {
//     id integer [primary key]
//     name varchar
//     description text
//     owner id
//     created_at timestamp
//     type string
//   }
const mongoose = require('mongoose');
require('mongoose')
const { Schema, model } = mongoose;
const collectionSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
    },
    ownerId: {
        type: String,
    },
    createdAt: {
        type: String,
    },
    type: {
        type: String,
    },
  },
  {
    versionKey: false,
    collection: 'Collections'
});
const collection = model('Collections', collectionSchema);
module.exports = collection;