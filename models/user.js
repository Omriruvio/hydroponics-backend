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
      imageUrl: String,
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

/**
 * @param {string} phoneNumber string representing user phone number 'e.g. whatsapp:+xxxxxxxxx'
 * @param {Date} toDate Start date from which the returned data will be matched
 * @param {number} dayOffset Optional day offset, useful for passing in current date with amount of days to go backwards
 * @returns {Promise} Promisified query results
 */
userSchema.statics.getMessageHistoryFrom = function (phoneNumber, toDate, dayOffset) {
  const fromDate = dayOffset ? new Date(toDate - dayOffset * 24 * 60 * 60 * 1000) : new Date(toDate);
  return this.findOne({
    phoneNumber,
    messageHistory: {
      $elemMatch: { dateReceived: { $gte: fromDate } },
    },
  })
    .select('messageHistory')
    .then((results) => {
      return results?.messageHistory.filter((message) => message.dateReceived > fromDate) || [];
    });
};

module.exports = mongoose.model('user', userSchema);
