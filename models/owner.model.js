// Table Owner {
//     stamp_id integer [pk]
//     owner_id integer [pk]
//     time timestamp
//   }

const mongoose = require('mongoose');
require('mongoose')
const { Schema, model } = mongoose;
const ownerSchema = new mongoose.Schema({
    stampId: {
      type: String,
      required: true,
      unique: true // Ensure uniqueness of your custom ID
    },
    ownerId: {
      type: String,
      required: true
    },
    time: {
      type: String,
    }
  },
  {
    versionKey: false,
    collection: 'Owners'
});
const Owner = model('Owners', ownerSchema);
module.exports = Owner;