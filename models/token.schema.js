// models/token.schema.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TokenSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true,
    collection: 'Token'
});

const Token = mongoose.model('Token', TokenSchema);
module.exports = Token;