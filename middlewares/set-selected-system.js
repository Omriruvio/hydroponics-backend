// middleware to set the selected system for the user crop data submission
// first checks if req.messageBody starts with system followed by a system name such as: 'system <system-name>'
// if it does, it sets req.selectedSystem to the system id and removes 'system <system-name>' and surrounding spaces from req.messageBody

const User = require('../models/user');
const { sendWhatsappMessage } = require('../utils/send-twilio-message');

module.exports = async (req, res, next) => {
  try {
    if (req.body.messageBody.toLowerCase().startsWith('system')) {
      const { messageBody } = req.body;
      const { phoneNumber } = req.body;
      const systemName = messageBody.split(' ')[1].toLowerCase();

      if (!systemName) {
        sendWhatsappMessage(phoneNumber, `Please follow the format: system <system-name>`);
        return res.status(204).send({ message: 'Please follow the format: system <system-name>' });
      }

      const user = await User.findOne({ phoneNumber }).populate('systems');
      const systemId = user.systems.find((system) => system.name === systemName)?._id;

      if (systemId) {
        req.selectedSystem = systemId;
        req.body.messageBody = messageBody.replace(`system ${systemName}`, '').trim();
        next();
      } else {
        sendWhatsappMessage(
          phoneNumber,
          `System "${systemName}" not found in your systems list.\nPlease follow the format: system <system-name> <data>`
        );
        return res.status(204).send({ message: 'System name not found in the user systems' });
      }
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};