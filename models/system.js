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
  ownerPhoneNumber: {
    type: String,
  },
  isPublic: {
    type: Boolean,
    default: false,
    // on change to true, check that the name is unique across all public systems
    validate: {
      validator: async function (isPublic) {
        if (isPublic && this.isModified('isPublic')) {
          const system = await this.constructor.findOne({ name: this.name, isPublic: true });
          if (system) throw new Error(`System name ${this.name} is already taken`);
        }
      },
      message: 'System name is not unique',
    },
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
    // on insert, update dateModified
    validate: {
      validator: function (messageHistory) {
        if (messageHistory.length > 0 && this.isModified('messageHistory')) {
          this.dateModified = Date.now();
        }
        return true;
      },
    },
  },
  users: {
    type: [mongoose.Types.ObjectId],
    ref: 'user',
  },
});

// when a new system is created console.log a message with it's name, id, and ownerName
systemSchema.post('save', function (doc, next) {
  // check that the saved system is in fact a new system by searching the id in the database
  this.constructor.findById(doc._id).then((system) => {
    if (!system) {
      console.log(`New system created: ${doc.name}\nSystem id: ${doc._id}\nSystem owner: ${doc.ownerName} ${doc.ownerPhoneNumber}`);
    } else {
      console.log(`System updated: ${doc.name}\nSystem id: ${doc._id}\nSystem owner: ${doc.ownerName} ${doc.ownerPhoneNumber}`);
    }
  next();
  });
});

/**
 * Creates a new system. If no name is provided, the system will be given a unique name-id.
 * also adds the system to the user's list of systems
 * @param {string} userId - The id of the user creating the system.
 * @param {string} name - The name of the system.
 * @returns {Promise<System>} A promise that resolves with the created system
 * if it is created successfully, otherwise rejects with an error.
 */

// (async () => {
//   const System = mongoose.model('system', systemSchema);
//   // const arrayOfSystemNames = await System.find({ owner: '6326525d1fcd5281f316c40a' }, { name: 1 });
//   const arrayOfSystemNames = await System.find({ owner: '6326525d1fcd5281f316c40a' }, { name: -1 });
//   console.log(arrayOfSystemNames);
// })();

systemSchema.statics.createSystem = async function (userId, name) {
  const User = require('./user');
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // check if the user already has a system with the same name, if so, append _<number> to the name until it is unique
  let systemName = name;
  const arrayOfSystemNames = await this.find({ owner: userId }, { name: 1 });
  let systemNameExists = arrayOfSystemNames.some((system) => system.name === systemName);

  let i = 1;
  while (systemNameExists) {
    systemName = `${name}_${i}`;
    systemNameExists = user.systems.find((system) => system.name === systemName);
    i++;
  }

  const system = await this.create({
    name: systemName,
    users: [userId],
    owner: userId,
    ownerName: user.username,
    ownerPhoneNumber: user.phoneNumber,
  });
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

// deletes a message from a system's message history
systemSchema.statics.deleteMessage = async function (systemId, messageId) {
  const system = await this.findById(String(systemId));
  if (!system) throw new Error('System not found');
  system.messageHistory = system.messageHistory.filter((message) => message.toString() !== messageId);
  return system.save();
};

/**
 * Renames a system.
 * System name must be unique in the user's list of systems. If it is not unique a number will be appended similarly to createSystem.
 * If the system is public, the name must be unique across all systems, otherwise a new name will be created by appending a number similarly to createSystem, but on a global level.
 * @param {string} systemId - The id of the system to rename.
 * @param {string} newName - The new name of the system.
 */

systemSchema.statics.renameSystem = async function (systemId, newName) {
  const system = await this.findById(systemId);
  if (!system) throw new Error('System not found');

  // check if the system is public, if it is check if the name is unique across all systems, otherwise, append a number to the name until it is unique on a global level
  if (system.public) {
    let systemName = newName;
    const arrayOfSystemNames = await this.find({}, { name: 1 });
    let systemNameExists = arrayOfSystemNames.some((system) => system.name === systemName);

    let i = 1;
    while (systemNameExists) {
      systemName = `${newName}_${i}`;
      systemNameExists = arrayOfSystemNames.some((system) => system.name === systemName);
      i++;
    }
    system.name = systemName;
    return system.save();
  } else {
    // check if the user already has a system with the same name, if so, append _<number> to the name until it is unique
    let systemName = newName;
    const arrayOfSystemNames = await this.find({ owner: system.owner }, { name: 1 });
    let systemNameExists = arrayOfSystemNames.some((system) => system.name === systemName);

    let i = 1;
    while (systemNameExists) {
      systemName = `${newName}_${i}`;
      systemNameExists = arrayOfSystemNames.find((system) => system.name === systemName);
      i++;
    }

    system.name = systemName;
    return system.save();
  }
};

module.exports = mongoose.model('system', systemSchema);
