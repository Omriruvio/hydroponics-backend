// middleware to set the selected system for the user crop data submission
// first checks if req.messageBody starts with system followed by a system name such as: 'system <system-name>'
// if it does, it sets req.selectedSystem to the system id and removes 'system <system-name>' and surrounding spaces from req.messageBody

const System = require('../models/system');
const { sendWhatsappMessage } = require('../utils/send-twilio-message');

module.exports = async (req, res, next) => {
  if (req.body.messageBody.startsWith('system')) {
    const { messageBody } = req.body;
    const { phoneNumber } = req.body;
    const systemName = messageBody.split(' ')[1];
    const system = await System.findOne({ name: systemName, ownerPhoneNumber: phoneNumber });
    if (system) {
      console.log('Setting system with name: ', systemName, ' and id: ', system._id);
      req.selectedSystem = system._id;
      req.messageBody = messageBody.replace(`system ${systemName}`, '').trim();
      next();
    } else {
      sendWhatsappMessage(
        phoneNumber,
        `System with name: ${systemName} was not found.\nTo submit data for a system, please send a message in the format:\n system <system-name> <data>`
      );
      res.status(204).send({ message: 'System not found' });
    }
  }
};
