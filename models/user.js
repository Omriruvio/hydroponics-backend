const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');

const userSchema = new mongoose.Schema({
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
  password: {
    type: String,
    // required: true,
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
      messageBody: { type: String, required: true },
      temperature: { type: String },
      humidity: { type: String },
      ph: { type: String },
      ec: { type: String },
      handled: { type: Boolean, default: false },
    },
  ],

  // // Todo: add message schema and link here
  // messageHistory: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'message'
  // }],
});

module.exports = mongoose.model('user', userSchema);
