const User = require('../models/user');
const System = require('../models/system');
const { sendWhatsappMessage } = require('../utils/send-twilio-message');

const addUserToSystem = async (req, res, next) => {
  const { systemId, userId } = req.body;
  try {
    const system = await System.findById(systemId);
    const user = await User.findById(userId);
    // add user and system to each other's arrays only if they are not already present
    if (!system.users.includes(user._id)) {
      system.users.push(user._id);
    }
    if (!user.systems.includes(system._id)) {
      user.systems.push(system._id);
    }
    // if the user doesn't have a default system, set the system they just joined as their default system
    if (!user.defaultSystem) {
      user.defaultSystem = system._id;
    }
    await system.save();
    await user.save();
    res.status(200).send({ message: 'User added to system successfully.', system });
  } catch (err) {
    next(err);
  }
};

const removeUserFromSystem = async (req, res, next) => {
  const { systemId, phoneNumber } = req.body;
  try {
    const system = await System.findById(systemId);
    const user = await User.findOne({ phoneNumber });
    system.users.pull(user);
    user.systems.pull(system);
    await system.save();
    await user.save();
    res.status(200).send({ message: 'User removed from system successfully.' });
  } catch (err) {
    next(err);
  }
};

const getSystemUsers = async (req, res, next) => {
  const { systemId } = req.params;
  try {
    const system = await System.findById(systemId).populate('users');
    res.status(200).send({ users: system.users });
  } catch (err) {
    next(err);
  }
};

/**
 * Renames a system if the message body starts with 'rename <old-system-name> <new-system-name>'
 * Non public systems will be autumatically renamed by appending a number to the end of the name to make them unique on a user level if the name is not unique
 * Public systems must be unique on a global level, if not, a number will be appended to the end of the name to make it unique on a global level
 * First finds the user by the phone number, then checks that the user owns the system, then renames the system
 * use the systemSchema.statics.renameSystem function to rename the system
 */

const renameSystem = async (req, res, next) => {
  try {
    const { phoneNumber, messageBody } = req.body;
    const user = await User.findOne({ phoneNumber });

    if (messageBody.startsWith('rename')) {
      const oldSystemName = messageBody.split(' ')[1]?.toLowerCase();
      const newSystemName = messageBody.split(' ')[2]?.toLowerCase();

      if (!oldSystemName || !newSystemName) {
        sendWhatsappMessage(phoneNumber, `Please follow the format: rename <old-system-name> <new-system-name>`);
        return res.status(204).send({ message: 'Please follow the format: rename <old-system-name> <new-system-name>' });
      }

      const oldSystem = await System.findOne({ name: oldSystemName, owner: user._id });

      if (!oldSystem) {
        sendWhatsappMessage(phoneNumber, `System "${oldSystemName}" does not exist`);
        return res.status(204).send({ message: `System "${oldSystemName}" does not exist` });
      }

      const renamedSystem = await System.renameSystem(oldSystem._id, newSystemName);

      if (renamedSystem) {
        sendWhatsappMessage(phoneNumber, `System "${oldSystemName}" renamed to "${renamedSystem.name}"`);
        res.status(200).send({ message: `System "${oldSystemName}" renamed to "${renamedSystem.name}"` });
      } else {
        sendWhatsappMessage(phoneNumber, `System "${oldSystemName}" not renamed`);
        res.status(204).send({ message: `System "${oldSystemName}" not renamed` });
      }
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Sets a system as public
 * Checks that the system name is publically unique and that the user is the system owner
 * If the system name is not unique, sends an error whatsapp message and response requesting a new request with a unique name
 * If the user does not own the system, sends an error whatsapp message and response
 */

// const setSystemPublic = async (req, res, next) => {
//   try {
//     const { phoneNumber, messageBody } = req.body;
//     const user = await User.findOne({ phoneNumber });

module.exports = {
  addUserToSystem,
  removeUserFromSystem,
  getSystemUsers,
  renameSystem,
};
