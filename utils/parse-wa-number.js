/**
 * Parses phone number from whatsapp number string.
 * @param {*} waNumberString string in following WA format 'whatsapp:+972587400020'
 * @returns corrected phone number string as such '+972587400020'
 */
const parseNumberFromWAString = (waNumberString) => {
  return waNumberString.match(/\+\d+$/)[0];
};

module.exports = parseNumberFromWAString;
