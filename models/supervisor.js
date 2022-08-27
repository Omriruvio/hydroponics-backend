const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');

const superVisorSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: { validator: isEmail, message: 'Email is invalid.' },
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    minLength: 6,
    required: true,
    select: false,
  },
  users: {
    type: [mongoose.Types.ObjectId],
    ref: 'user',
  },

  messageOptIn: {
    type: Boolean,
    required: true,
    default: false,
  },
  receiveReminders: {
    type: Boolean,
    required: true,
    default: false,
  },
  lastInteraction: {
    type: Date,
  },
  lastReceivedPush: {
    type: Date,
  },
});

module.exports = mongoose.model('supervisor', superVisorSchema);
