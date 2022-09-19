/**
 * Receives string in the following format: '0501234567' and returns a string in the following format: 'whatsapp:+972501234567'
 * @param {string} number - The number to be converted
 * @returns {string} - The converted number
 */

const getWhatsappNumber = (number) => {
  return `whatsapp:+972${number.substring(1)}`;
};

module.exports = getWhatsappNumber;
