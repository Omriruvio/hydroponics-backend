// message template to be sent to invited user
// Hello, as a part of your Hydroponics Network subscription, you have been invited by {{1}} to collaborate on a system named "{{2}}"
// You can now send crop data related to this system with the following format:
// system {{3}} temp <value> ec <value> ph <value>

/**
 * Generates a message to be sent to a user that has been invited to collaborate on a system according to the following template:
 * Hello, as a part of your Hydroponics Network subscription, you have been invited by {{1}} to collaborate on a system named "{{2}}"
 * You can now send crop data related to this system with the following format:
 * system {{3}} temp <value> ec <value> ph <value>
 * @param {string} inviterName - The name of the user that invited the other user
 * @param {string} systemName - The name of the system that the user has been invited to collaborate on
 * @returns {string} - The message to be sent to the invited user
 */

const getInviteMessage = (inviterName, systemName) => {
  // warning: this is a template message approved by twilio/whatsapp and should not be changed without prior approval
  return `Hello, as a part of your Hydroponics Network subscription, you have been invited by ${inviterName} to collaborate on a system named "${systemName}"
You can now send crop data related to this system with the following format:
system ${systemName} temp <value> ec <value> ph <value>`;
};

module.exports = getInviteMessage;
