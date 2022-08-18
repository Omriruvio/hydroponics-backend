const { PUSH_MIN_DELAY_PERIOD_TEXT } = require('../config');

/**
 *
 * @param {String} userName
 * @returns {String} Formatted message approved by whatsapp - do not change without the related procedure to approve a new message.
 */
const getFormattedPushMessage = (userName = 'user') => {
  // warning: do not change below message format without going through the approval process with whatsapp.
  return `Hello ${userName}, this reminder is sent as a service of your subscription to Hydroponics Network.
  You have not submitted your crop data this ${PUSH_MIN_DELAY_PERIOD_TEXT}.
  You may respond with a message containing the data or 'help' if you require assistance.`;
};

module.exports = { getFormattedPushMessage };
