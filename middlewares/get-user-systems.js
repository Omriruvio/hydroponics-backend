/**
 * Middleware to get the user's systems
 * if the message body starts with 'my systems', get the user's systems and send a whatsapp message with a comma separated list of system names and a success response
 */

const system = require('../models/system');
const User = require('../models/user');
const { sendWhatsappMessage } = require('../utils/send-twilio-message');

const getUserSystems = async (req, res, next) => {
  try {
    if (req.body.messageBody.startsWith('my systems')) {
      const { phoneNumber } = req.body;

      const user = await User.findOne({ phoneNumber }).populate('systems defaultSystem');
      const userDefaultSystemName = user.defaultSystem?.name;

      if (user.systems.length) {
        const systemNames = user.systems.map((system) => system.name).join(', ');
        sendWhatsappMessage(phoneNumber, `*Your system names:*\n${systemNames}\n\n*Default system:*\n${userDefaultSystemName}`);
        res.status(200).send({ message: 'User systems sent successfully', systemNames });
      } else {
        sendWhatsappMessage(phoneNumber, `You don't have any systems`);
        res.status(204).send({ message: 'User has no systems' });
      }
    } else {
      next();
    }
  } catch (error) {
    next(error);
  }
};

module.exports = getUserSystems;
