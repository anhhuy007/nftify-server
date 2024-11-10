// Table Stamps {
//   id integer [pk]
//   creator VARCHAR(50)                  ------------------
//   url TEXT [not null]
//   title VARCHAR(50)
//   issued_by VARCHAR(100) [not null]    
//   function VARCHAR(50)
//   date DATE           
//   denom VARCHAR(20)
//   color VARCHAR(50)
//   created_time timestamp                 ---------------------------
// }

const mongoose = require('mongoose');
require('mongoose')
const { Schema, model } = mongoose;
const itemSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true,
      unique: true 
    },
    creatorId:{
      type: String,
      required: true,
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
    },
    createdAt:{
      type: String,
    }
  },
  {
    versionKey: false,
    collection: 'Items'
});
const Item = model('Items', itemSchema);
module.exports = Item;