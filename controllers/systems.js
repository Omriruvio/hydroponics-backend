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

    if (messageBody.toLowerCase().startsWith('rename')) {
      const oldSystemName = messageBody.split(' ')[1]?.toLowerCase();
      const newSystemName = messageBody.split(' ')[2]?.toLowerCase();

      if (!oldSystemName || !newSystemName) {
        sendWhatsappMessage(phoneNumber, `Please follow the format: rename <old-system-name> <new-system-name>`);
        return res.status(204).send({ message: 'Please follow the format: rename <old-system-name> <new-system-name>' });
      }

      const oldSystem = await System.findOne({ name: oldSystemName, owner: user._id });

      if (!oldSystem) {
        sendWhatsappMessage(phoneNumber, `System "${oldSystemName}" does not exist, or you do not own it`);
        return res.status(204).send({ message: `System "${oldSystemName}" does not exist, or not owned by the user` });
      }

      const renamedSystem = await System.renameSystem(oldSystem._id, newSystemName);

      if (renamedSystem) {
        !req.isWeb && sendWhatsappMessage(phoneNumber, `System "${oldSystemName}" renamed to "${renamedSystem.name}"`);
        res.status(200).send({ message: `System "${oldSystemName}" renamed to "${renamedSystem.name}"`, newSystemName: renamedSystem.name });
      } else {
        !req.isWeb && sendWhatsappMessage(phoneNumber, `System "${oldSystemName}" not renamed`);
        res.status(204).send({ message: `System "${oldSystemName}" not renamed` });
      }
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

const webRenameSystem = async (req, res, next) => {
  // receives systemId from req.params and newSystemName from req.body
  // set req.body.phoneNumber to the owner's phone number by finding the user with req.user._id
  // find the old system name by finding the system with req.params.systemId
  // set req.body.messageBody to 'rename <old-system-name> <new-system-name>'
  // call renameSystem
  try {
    const { systemId } = req.params;
    const { systemName } = req.body;
    const user = await User.findById(req.user._id);
    const oldSystem = await System.findById(systemId);
    req.body.phoneNumber = user.phoneNumber;
    req.body.messageBody = `rename ${oldSystem.name} ${systemName}`;
    req.isWeb = true;
    renameSystem(req, res, next);
  } catch (error) {
    next(error);
  }
};

/**
 * Sets a system as public, either receives messageBody parameter from the request body formatted as 'set public <system-name>' or receives systemId parameter from the request body
 * Checks that the system name is publically unique and that the user is the system owner
 * If the system name is not unique, sends an error whatsapp message and response requesting a new request with a unique name
 * If the user does not own the system, sends an error whatsapp message and response
 */

const setSystemPublic = async (req, res, next) => {
  // receives messageBody parameter from the request body formatted as 'set public <system-name>'
  // or receives systemId parameter from the request body
  try {
    const { phoneNumber, messageBody } = req.body;
    const user = await User.findOne({ phoneNumber });
    if (messageBody?.startsWith('set public')) {
      const systemName = messageBody.split(' ')[2]?.toLowerCase();
      if (!systemName) {
        !req.isWeb && sendWhatsappMessage(phoneNumber, `Please follow the format: set public <system-name>`);
        return res.status(204).send({ message: 'Please follow the format: set public <system-name>' });
      }
      // check that the user owns the system by searching the users' systems array for the system name and checking that the systemOwner is the user
      const system = await System.findOne({ name: systemName, owner: user._id });
      if (!system) {
        !req.isWeb && sendWhatsappMessage(phoneNumber, `System "${systemName}" does not exist or you do not own it`);
        return res.status(204).send({ message: `System "${systemName}" does not exist or not owned by the user` });
      }
      // check all the systems except for the one being set as public to see if the name is unique
      const publicSystems = await System.find({ isPublic: true });
      const publicSystemNames = publicSystems.reduce((acc, currentSystem) => {
        if (currentSystem._id.toString() !== system._id.toString()) {
          acc.push(currentSystem.name);
        }
        return acc;
      }, []);

      if (publicSystemNames?.includes(systemName)) {
        !req.isWeb && sendWhatsappMessage(phoneNumber, `System name "${systemName}" is not unique, please choose a different name`);
        return res.status(204).send({ message: `System name "${systemName}" is not unique, please choose a different name` });
      }

      // set the system as public
      system.isPublic = true;
      await system.save();
      !req.isWeb && sendWhatsappMessage(phoneNumber, `System "${systemName}" is now public`);
      res.status(200).send({ message: `System "${systemName}" is now public` });
    } else if (req.body.systemId) {
      const system = await System.findById(req.body.systemId);
      if (!system) {
        !req.isWeb && sendWhatsappMessage(phoneNumber, `System "${systemName}" does not exist or you do not own it`);
        return res.status(204).send({ message: `System "${systemName}" does not exist or not owned by the user` });
      }
      // check that the system name is unique on a global level
      const publicSystem = await System.findOne({ name: system.name, isPublic: true });
      if (publicSystem) {
        !req.isWeb && sendWhatsappMessage(phoneNumber, `System "${system.name}" is not unique, please choose a different name`);
        return res.status(204).send({ message: `System "${system.name}" is not unique, please choose a different name` });
      }
      // set the system as public
      system.isPublic = true;
      await system.save();
      res.status(200).send({ message: `System "${system.name}" is now public`, system });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

const webSetSystemAccess = async (req, res, next) => {
  // receives systemId from req.params
  // set req.body.phoneNumber to the owner's phone number by finding the user with req.user._id
  // set req.body.messageBody to 'set public/private <system-name>'
  // call setSystemPublic / setSystemPrivate
  try {
    const { systemId } = req.params;
    const { isPublic } = req.body;
    req.isWeb = true;
    const user = await User.findById(req.user._id);
    const system = await System.findById(systemId);
    req.body.phoneNumber = user.phoneNumber;
    req.body.messageBody = `set ${isPublic ? 'public' : 'private'} ${system.name}`;
    if (isPublic) {
      setSystemPublic(req, res, next);
    } else {
      setSystemPrivate(req, res, next);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Sets a system as private, either receives messageBody parameter from the request body formatted as 'set private <system-name>' or receives systemId parameter from the request body
 * Checks that the user is the system owner
 */

const setSystemPrivate = async (req, res, next) => {
  // receives messageBody parameter from the request body formatted as 'set private <system-name>'
  // or receives systemId parameter from the request body
  try {
    const { phoneNumber, messageBody } = req.body;
    const user = await User.findOne({ phoneNumber });
    if (messageBody?.startsWith('set private')) {
      const systemName = messageBody.split(' ')[2]?.toLowerCase();
      if (!systemName) {
        !req.isWeb && sendWhatsappMessage(phoneNumber, `Please follow the format: set private <system-name>`);
        return res.status(204).send({ message: 'Please follow the format: set private <system-name>' });
      }
      // check that the user owns the system by searching the users' systems array for the system name and checking that the systemOwner is the user
      const system = await System.findOne({ name: systemName, owner: user._id });
      if (!system) {
        !req.isWeb && sendWhatsappMessage(phoneNumber, `System "${systemName}" does not exist or you do not own it`);
        return res.status(204).send({ message: `System "${systemName}" does not exist or not owned by the user` });
      }
      // set the system as private
      system.isPublic = false;
      await system.save();
      !req.isWeb && sendWhatsappMessage(phoneNumber, `System "${systemName}" is now private`);
      res.status(200).send({ message: `System "${systemName}" is now private` });
    } else if (req.body.systemId) {
      const system = await System.findById(req.body.systemId);
      if (!system) {
        !req.isWeb && sendWhatsappMessage(phoneNumber, `System "${systemName}" does not exist or you do not own it`);
        return res.status(204).send({ message: `System "${systemName}" does not exist or not owned by the user` });
      }
      // set the system as private
      system.isPublic = false;
      await system.save();
      res.status(200).send({ message: `System "${system.name}" is now private`, system });
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

/**
 * gets a system by ID from the request query parameter systemId
 * sends a web response with the system object
 */

const getSystem = async (req, res, next) => {
  try {
    const system = await System.findById(req.query.systemId);
    if (!system) {
      return res.status(404).send({ message: 'System does not exist' });
    }
    res.status(200).send({ system });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addUserToSystem,
  removeUserFromSystem,
  getSystemUsers,
  renameSystem,
  setSystemPublic,
  setSystemPrivate,
  getSystem,
  webRenameSystem,
  webSetSystemAccess,
};
