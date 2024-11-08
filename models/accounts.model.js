// Table Account {
//     id integer [primary key]
//     username varchar
//     email varchar
//     password password
//     created_at timestamp
//   }
const mongoose = require('mongoose');
require('mongoose')
const { Schema, model } = mongoose;
const accountSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true,
      unique: true 
    },
    username: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    email: {
      type: String,
      unique: true
    },
    createdAt: {
      type: String,
    },
  },
  {
    versionKey: false, 
    collection: 'Accounts'
});
const Account = model('Accounts', accountSchema);
module.exports = Account;