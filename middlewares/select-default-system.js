// if req.messageBody exists and starts with 'default system <system-name>', it finds the system name in the user's systems array and sets it as the default system
// sends a success whatsapp message and response if the system is found and a failure message and response if the system is not found

const User = require('../models/user');
const { sendWhatsappMessage } = require('../utils/send-twilio-message');

const selectDefaultSystem = async (req, res, next) => {
  try {
    if (req.body.messageBody.startsWith('default system')) {
      const { messageBody } = req.body;
      const { phoneNumber } = req.body;
      const systemName = messageBody.split(' ')[2]?.toLowerCase();

      if (!systemName) {
        sendWhatsappMessage(phoneNumber, `Please follow the format: default system <system-name>`);
        return res.status(204).send({ message: 'Please follow the format: default system <system-name>' });
      }

      const user = await User.findOne({ phoneNumber }).populate('systems');
      const systemId = user.systems.find((system) => system.name === systemName)?._id;

      if (systemId) {
        user.defaultSystem = systemId;
        await user.save();
        sendWhatsappMessage(phoneNumber, `System "${systemName}" set as default system`);
        res.status(200).send({ message: 'Default system set successfully' });
      } else {
        sendWhatsappMessage(phoneNumber, `System "${systemName}" not found in your systems list`);
        res.status(204).send({ message: 'System name not found in the user systems' });
      }
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = selectDefaultSystem;
