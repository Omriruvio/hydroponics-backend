const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const systemSchema = new mongoose.Schema({
  name: {
    type: String,
    default: () => {
      return uuidv4();
    },
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
  },
  ownerName: {
    type: String,
  },
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
  dateModified: {
    type: Date,
    default: Date.now(),
  },
  messageHistory: {
    type: [mongoose.Types.ObjectId],
    ref: 'message',
  },
  users: {
    type: [mongoose.Types.ObjectId],
    ref: 'user',
  },
});

/**
 * Creates a new system. If no name is provided, the system will be named after its id.
 * also adds the system to the user's list of systems
 * @param {string} userId - The id of the user creating the system.
 * @param {string} name - The name of the system.
 * @returns {Promise<System>} A promise that resolves with the created system
 * if it is created successfully, otherwise rejects with an error.
 */

systemSchema.statics.createSystem = async function (userId, name) {
  const User = require('./user');
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  const system = await this.create({ name, users: [userId], owner: userId, ownerName: user.username });
  user.systems.push(system._id);
  await user.save();
  return system;
};

/**
 * Adds crop data to the system's message history.
 * Receives system id and an object with the following properties:
 * { temperature, humidity, ph, ec, imageUrl, healthState, messageBody }
 * @param {string} systemId - The id of the system to add the message to.
 * @param {object} messageId - The message id to add to the system's message history.
 * @returns {Promise<System>} A promise that resolves with the system
 * if the message is added successfully, otherwise rejects with an error.
 * @throws {Error} If the system is not found.
 * @throws {Error} If the message is not valid.
 */

systemSchema.statics.addCropData = function (systemId, messageId) {
  return this.findById(systemId)
    .then((system) => {
      if (!system) {
        throw new Error('System not found');
      }
      system.messageHistory.push(messageId);
      return system.save();
    })
    .catch((err) => {
      throw new Error(err);
    });
};

/**
 * Adds a user to the system's list of users.
 * @param {string} systemId - The id of the system to add the user to.
 * @param {string} userId - The id of the user to add to the system.
 * @returns {Promise<System>} A promise that resolves with the system
 */

systemSchema.statics.addUser = async function (systemId, userId) {
  const system = await this.findById(systemId);
  if (!system) {
    throw new Error('System not found');
  }
  system.users.push(userId);
  return system.save();
};

/**
 * Receives user id, searches through the messages of all the systems to find messages whose user is equal to the user id.
 * Returns the most recently received message.
 * if no messages exist, returns null
 */

systemSchema.statics.getLastMessage = async function (userId) {
  // make an array by finding all messageHistory messages from all systems with user field equal to userId
  const messages = await this.find({ 'messageHistory.user': userId }, { 'messageHistory.$': 1 });
  // sort the array by dateReceived
  messages.sort((a, b) => {
    return b.messageHistory[0].dateReceived - a.messageHistory[0].dateReceived;
  });
  // return the first element of the array
  return messages[0];
};

/**
 * Receives user.systems - array of system ids, finds the system with the most recent message and deletes it
 */

systemSchema.statics.deleteLastMessage = async function (systems) {};



module.exports = mongoose.model('system', systemSchema);
