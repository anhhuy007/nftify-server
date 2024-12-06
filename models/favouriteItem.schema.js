// Table FavouriteItem {
//   _id string [pk]
//   userId string unique
//   itemId array [note: 'list of items']
//   createdAt timestamp [default: `now()`]
// }

const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const FavouriteItemSchema = new Schema(
    {
        userId: {
            type: String,
            required: true,
            unique: true,
        },
        itemId: {
            type: [String],
        },
    },
    {
        versionKey: false,
        timestamps: { createdAt: true, updatedAt: true }, //because adding array of items to the favourite list is an update
        collection: "FavouriteItem",
    }
);

const FavouriteItem = model("FavouriteItem", FavouriteItemSchema);
module.exports = FavouriteItem;
