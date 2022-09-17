const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
  },
  imageUrl: String,
  dateReceived: {
    type: Date,
    default: Date.now(),
  },
  messageBody: {
    type: String,
  },
  temperature: {
    type: String,
  },
  humidity: {
    type: String,
  },
  ph: {
    type: String,
  },
  ec: {
    type: String,
  },
  handled: {
    type: Boolean,
    default: false,
  },
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
});

/**
 * Add a message to messages collection and return the message object
 * @param {Object} message - The message object to be added to the database
 * @returns {Promise<Message>} A promise that resolves with the created message
 */

messageSchema.statics.addMessage = async function (message) {
  const Message = require('./message');
  const User = require('./user');
  const user = await User.findById(message.user);
  if (!user) {
    throw new Error(`Attempted to add message with a user id of: ${message.user} but user not found`);
  }
  const newMessage = await Message.create(message);
  return newMessage;
};

/**
 * Deletes last message by the specified user
 * @param {string} userId - The id of the user to delete the last message from.
 * @returns {Promise<Message>} A promise that resolves with the deleted message
 */

messageSchema.statics.deleteLastMessage = async function (userId) {
  const User = require('./user');
  const user = await User.findById(userId);
  if (!user) {
    throw new Error(`Attempted to delete last message from a user id of: ${userId} but user not found`);
  }
  const lastMessage = await this.findOne({ user: userId }).sort({ dateReceived: -1 });
  const deletedMessage = await this.findByIdAndDelete(lastMessage?._id);
  return deletedMessage;
};

module.exports = mongoose.model('message', messageSchema);
