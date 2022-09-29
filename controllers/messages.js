const Message = require('../models/message');
const User = require('../models/user');
const System = require('../models/system');

/**
 * Receives body with { _id, ec, ph, temperature, systemName }
 * Finds the user from the req.user._id
 * Validates that the system name exists in the user's systems
 * Updates the message in the messages collection with the provided data
 * Returns the updated message
 **/

const handleMessageUpdate = async (req, res, next) => {
  try {
    const { _id, ec, ph, temperature, systemName } = req.body;

    if (!systemName) {
      // system name change was not required - update the message with the provided data
      const message = await Message.findByIdAndUpdate(_id, { ec, ph, temperature }, { new: true });
      res.status(200).send(message);
    } else {
      // system name change was required:
      // pre-validate that the required system name is valid by finding a system in the systems collection with the req.user._id in its users array and the system name provided in the req.body
      // 1. update the message with the provided data in the message collection
      // 2. update the systemName property in the message document
      // 3. update the systemId in the system property of the message
      // 4. update the old system's messages array by removing the message id from the messageHistory array
      // 5. update the new system's messages array by adding the message id to the messageHistory array
      const requiredSystem = await System.findOne({ users: String(req.user._id), name: systemName });
      if (!requiredSystem) {
        return res.status(400).send({ message: 'System not found' });
      }
      const originalMessage = await Message.findById(_id);
      const oldSystemId = originalMessage.system;
      const message = await Message.findByIdAndUpdate(_id, { ec, ph, temperature, systemName, system: requiredSystem._id }, { new: true });
      message.systemName = systemName;
      message.system = requiredSystem._id;
      await message.save();
      const oldSystem = await System.findById(oldSystemId);
      oldSystem.messageHistory = oldSystem.messageHistory.filter((messageId) => String(messageId) !== String(message._id));
      await oldSystem.save();
      requiredSystem.messageHistory.push(message._id);
      await requiredSystem.save();
      res.status(200).send(message);
    }
  } catch (error) {
    next(error);
  }
};

const handleDeleteMessage = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { messageId } = req.body;
    const message = await Message.findByIdAndDelete(messageId);
    const system = await System.findById(message.system);
    system.messageHistory = system.messageHistory.filter((messageId) => String(messageId) !== String(message._id));
    await system.save();
    const user = await User.findById(userId);
    user.messageHistory = user.messageHistory.filter((messageId) => String(messageId) !== String(message._id));
    await user.save();
    res.status(200).send({ message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleMessageUpdate, handleDeleteMessage };
