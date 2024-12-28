const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const notiMes = {
  message: String,
  read: Boolean, 
  time: Date
};

const NotificationSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    notifications: {
      type: [notiMes],
      default: [],
    }
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'Notification',
  }
);

const Notification = model('Notification', NotificationSchema);
module.exports = Notification;