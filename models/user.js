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
    validate: {
      // if the user has no default system, and a system was added to the systems array, if a system is added, set it as the default system
      validator: async function (systems) {
        if (!this.defaultSystem && systems.length > 0 && this.isModified('systems')) {
          this.defaultSystem = systems[0];
        }
        return true;
      },
    },
  },
  messageHistory: [{ type: mongoose.Types.ObjectId, ref: 'message' }],
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
  const fromDate = new Date(toDate);
  fromDate.setDate(fromDate.getDate() - dayOffset);
  const inDateRange = (message) => message.dateReceived >= fromDate && message.dateReceived <= toDate;

  // if no systemId is provided, return all user messages from user messageHistory
  if (!systemId) {
    const user = await this.findOne({ phoneNumber }).populate('messageHistory');
    if (!user) throw new Error('User not found');
    return user.messageHistory.filter(inDateRange);
  }

  // if a systemId is provided, return all messages from the system's messageHistory
  const system = await System.findById(systemId).populate('messageHistory');
  if (!system) throw new Error('System not found');
  return system.messageHistory.filter(inDateRange);
};

// // if no systemId is provided, check if the user has a default system, if they do, return the messages from the user's message history and the messages from the default system message history. if the user default system is not valid, return the user's message history.
// if (!systemId) {
//   const user = await this.findOne({ phoneNumber });
//   if (!user) throw new Error('User not found');
//   const userMessageHistory = user.messageHistory.filter(inDateRange);
//   if (user.defaultSystem) {
//     const system = await System.findById(user.defaultSystem);
//     if (!system) return userMessageHistory;
//     return [...userMessageHistory, ...system.messageHistory.filter(inDateRange)];
//   }
//   return userMessageHistory;
// }
// // get system message history
// const system = await System.findById(systemId);
// if (!system) throw new Error('System not found');
// return system.messageHistory.filter(inDateRange);

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

userSchema.statics.deleteLastMessage = async function (userId) {
  const user = await this.findById(userId);
  if (!user) throw new Error('User not found');
  user.messageHistory.pop();
  return user.save();
};

// add a message to the user's message history
userSchema.statics.addMessage = async function (userId, messageId) {
  const user = await this.findById(userId);
  if (!user) throw new Error('User not found');
  user.messageHistory.push(messageId);
  return user.save();
};

// delete a message from the user's message history
userSchema.statics.deleteMessage = async function (userId, messageId) {
  const user = await this.findById(userId);
  if (!user) throw new Error('User not found');
  user.messageHistory = user.messageHistory.filter((message) => message.toString() !== messageId);
  return user.save();
};

module.exports = mongoose.model('user', userSchema);
