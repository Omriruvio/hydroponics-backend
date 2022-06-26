const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');

const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: { validator: isEmail, message: 'Email is invalid.' },
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  messageOptIn: {
    type: Boolean,
    required: true,
    default: false,
  },
  messageHistory: [
    {
      dateReceived: { type: Date, default: Date.now() },
      messageBody: String,
      handled: { type: Boolean, default: false },
    },
  ],
});

module.exports = mongoose.model('user', userSchema);
