const mongoose = require('mongoose');
require('mongoose')
const { Schema, model } = mongoose;
const userSchema = new mongoose.Schema({
    id: {
      type: String,
      required: true,
      unique: true // Ensure uniqueness of your custom ID
    },
    avaUrl: {
        type: String,
    },
    name: {
        type: String,
        required: true,
        maxlength: 50,
    },
    description: {
        type: String,
    },
  },
  {
    versionKey: false, // This will prevent the __v field from being added
    // collection: 'Items'
    collection: 'Users'
});
const User = model('Users', userSchema);
module.exports = User;


// Table User {
//     id integer [primary key]
//     name varchar
//     description varchar
//     avatar_url varchar
//   }
  