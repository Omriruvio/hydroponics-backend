/**
 * Middleware to create a new system if the message body starts with 'create system <system-name>'
 * if it does, create a new system and send a success whatsapp message to the user and a success response
 * uses systemSchema.statics.createSystem = async function (userId, name) to add the system to the user's systems array and the user to the system's users array
 */

const System = require('../models/system');
const User = require('../models/user');
const { sendWhatsappMessage } = require('../utils/send-twilio-message');

const createNewSystem = async (req, res, next) => {
  try {
    if (req.body.messageBody.startsWith('create system')) {
      const { messageBody } = req.body;
      const { phoneNumber } = req.body;
      const systemName = messageBody.split(' ')[2].toLowerCase();

      if (!systemName) {
        sendWhatsappMessage(phoneNumber, `Please follow the format: create system <system-name>`);
        return res.status(204).send({ message: 'Please follow the format: create system <system-name>' });
      }

      const user = await User.findOne({ phoneNumber }).populate('systems');
      const createdSystem = await System.createSystem(user._id, systemName);

      if (createdSystem) {
        sendWhatsappMessage(phoneNumber, `System "${createdSystem.name}" created successfully`);
        res.status(200).send({ message: 'System created successfully', systemId: createdSystem._id });
      } else {
        sendWhatsappMessage(phoneNumber, `System "${systemName}" not created`);
        res.status(204).send({ message: 'System not created' });
      }
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = createNewSystem;
