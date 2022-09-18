const { TWILIO_SID, TWILIO_AUTH_TOKEN, HYDROPONICS_WA_NUMBER } = process.env;
const client = require('twilio')(TWILIO_SID, TWILIO_AUTH_TOKEN);

/**
 * Sends a whatsapp message to a specified phone number with the provided message.
 * Does not run in test environment
 * @param {string} phoneNumber string representing user phone number 'e.g. whatsapp:+xxxxxxxxx'
 * @param {string} message message to be sent
 * @returns {Promise} promise that resolves to the message sent
 * @throws {Error} if message sending fails
 */

const sendWhatsappMessage = (phoneNumber, message) => {
  if (process.env.NODE_ENV === 'test') return;
  return client.messages.create({
    body: message,
    from: HYDROPONICS_WA_NUMBER,
    to: phoneNumber,
  });
};

module.exports = { sendWhatsappMessage };
