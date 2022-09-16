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
  messageHistory: [
    {
      user: { type: mongoose.Types.ObjectId, ref: 'user' },
      imageUrl: String,
      dateReceived: { type: Date, default: Date.now() },
      messageBody: { type: String },
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
 * @param {object} message - The message to add to the system's message history.
 * @returns {Promise<System>} A promise that resolves with the system
 * if the message is added successfully, otherwise rejects with an error.
 * @throws {Error} If the system is not found.
 * @throws {Error} If the message is not valid.
 */

systemSchema.statics.addCropData = function (systemId, message) {
  return this.findById(systemId)
    .then((system) => {
      if (!system) {
        throw new Error('System not found');
      }
      system.messageHistory.push(message);
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
 * Receives user.systems - array of system ids, returns the most recent message out of all latest systems messages
 */

systemSchema.statics.getLastMessage = async function (systems) {
  // make an array of all the latest messages from each system
  // find the most recent message out of all the latest messages
  const latestMessages = await Promise.all(
    systems.map(async (system) => {
      const systemMessages = await this.findById(system).select('messageHistory');
      const latestMessage = systemMessages.messageHistory[systemMessages.messageHistory.length - 1];
      return latestMessage;
    })
  );
  const mostRecentMessage = latestMessages.reduce((acc, curr) => 
    acc.dateReceived > curr.dateReceived ? acc : curr);
  
  return mostRecentMessage || null;
};

/**
 * Receives user.systems - array of system ids, finds the system with the most recent message and deletes it
 */

systemSchema.statics.deleteLastMessage = async function (systems) {
  const latestMessages = await Promise.all(
    systems.map(async (system) => {
      const systemMessages = await this.findById(system).select('messageHistory');
      const latestMessage = systemMessages.messageHistory[systemMessages.messageHistory.length - 1];
      return latestMessage;
    })
  );
  
  const mostRecentMessage = latestMessages.reduce((acc, curr) => 
    acc.dateReceived > curr.dateReceived ? acc : curr);
  
  const system = await this.findById(mostRecentMessage._id);
  system?.messageHistory?.pop();
  return system ? system.save() : null;
};



module.exports = mongoose.model('system', systemSchema);
