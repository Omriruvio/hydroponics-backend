const emptyDataReponse =
  'We could not understand your message.\n' +
  'Please submit data in the following format:\n' +
  '"*_temp_* value *_humidity_* value *_ph_* value *_ec_* value".\n' +
  'If further help is needed respond with "help".';
const responseMessageIntro = '*Recorded data for system - ';
const responseMessageOutro = '\n\nIf the above information is incorrect, you may reply with "delete".\n';

/**
 *
 * @param data Object containing temp, humidity, ph and ec values (or nulls of each)
 * @returns String representing message to be send as response to the user
 *
 */

const getResponseMessage = (data, systemName) => {
  if (Object.values(data).every((value) => !value)) return emptyDataReponse;
  let responseMessageBody = '';
  for (const [key, value] of Object.entries(data)) {
    if (value) {
      const caseCorrectKey = key[0].toUpperCase() + key.slice(1);
      responseMessageBody += `\n${caseCorrectKey}: ${value}`;
    }
  }

  return responseMessageIntro + systemName + ':' + '*\n' + responseMessageBody + responseMessageOutro;
};

module.exports = getResponseMessage;
