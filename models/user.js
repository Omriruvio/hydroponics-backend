const mongoose = require('mongoose');
const isEmail = require('validator/lib/isEmail');
const System = require('./system');
const logError = require('../utils/errors/log-error');

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
  username: {
    type: String,
    required: true,
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
  defaultSystem: {
    type: mongoose.Types.ObjectId,
    ref: 'system',
  },
  systems: {
    type: [mongoose.Types.ObjectId],
    ref: 'system',
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
      healthState: {
        isHealthy: {
          type: String,
          enum: ['positive', 'likely-positive', 'likely-negative', 'negative'],
        },
        hasPestPresence: {
          type: String,
          enum: ['positive', 'likely-positive', 'likely-negative', 'negative'],
        },
        hasDeficiencies: {
          type: String,
          enum: ['positive', 'likely-positive', 'likely-negative', 'negative'],
        },
      },
    },
  ],
});

/**
 * receives phoneNumber, toDate, number of days to go back and an optional systemId pointing to the user's system to query
 * the returned array is sorted by dateReceived in descending order
 * @param {string} phoneNumber string representing user phone number 'e.g. whatsapp:+xxxxxxxxx'
 * @param {Date} toDate Maximum date to search for messages (usually Date.now())
 * @param {number} dayOffset Optional day offset, useful for passing in current date with amount of days to go backwards
 * @param {string} systemId Optional systemId, if not provided, will return data from the default system
 * @returns {Array} Array containing of messages sorted by dateReceived in descending order
 */

userSchema.statics.getMessageHistoryFrom = async function (phoneNumber, toDate, dayOffset, systemId) {
  if (!systemId) {
    const user = await this.findOne({ phoneNumber });
    systemId = user.defaultSystem;
    if (!systemId) {
      throw new Error('No system id was specified and no default system found');
    }
  }

  const fromDate = new Date(toDate);
  fromDate.setDate(fromDate.getDate() - dayOffset);
  const system = await System.findById(systemId);
  const messages = system.messageHistory.filter((message) => {
    return message.dateReceived >= fromDate && message.dateReceived <= toDate;
  });

  // if user.messageHistory contains messages, filter them according to the same criteria and add them to the results array
  const user = await this.findOne({ phoneNumber });
  if (user.messageHistory.length > 0) {
    const userMessages = user.messageHistory.filter((message) => {
      return message.dateReceived >= fromDate && message.dateReceived <= toDate;
    });
    messages.push(...userMessages);
  }

  return messages;
};

/**
 *
 * @param {*} phoneNumber string representing user phone number 'e.g. whatsapp:+xxxxxxxxx'
 * @returns Updated user document
 */
userSchema.statics.setLastInteraction = function (phoneNumber) {
  // prettier-ignore
  return this.findOneAndUpdate(
    { phoneNumber },
    { lastInteraction: Date.now() },
    { upsert: true, new: true });
};

/**
 * Sets the default system for a user
 */
userSchema.statics.setDefaultSystem = function (phoneNumber, systemId) {
  return this.findOneAndUpdate({ phoneNumber }, { defaultSystem: systemId }, { upsert: true, new: true });
};

/**
 * sets the last interaction date for a user
 */
userSchema.statics.setLastInteraction = function (phoneNumber) {
  return this.findOneAndUpdate({ phoneNumber }, { lastInteraction: Date.now() }, { upsert: true, new: true });
};

/**
 * adds a system to the user's systems array, sets it as the default system if it's the first system, adds the user to the system's users array
 * receives a userId and a systemId
 * @param {string} userId
 * @param {string} systemId
 * @returns Updated user document
 */
userSchema.statics.addSystem = async function (userId, systemId) {
  const user = await this.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  if (!user.systems.includes(systemId)) {
    user.systems.push(systemId);
  }
  if (!user.defaultSystem) {
    user.defaultSystem = systemId;
  }
  return user.save();
};



 

module.exports = mongoose.model('user', userSchema);
