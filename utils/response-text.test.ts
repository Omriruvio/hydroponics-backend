const getResponseMessage = require('./response-text');
const emptyDataReponse = `We could not understand your message.\nPlease submit data in the following format:\n"*_temp_* value *_humidity_* value *_ph_* value *_ec_* value".\nIf further help is needed respond with "help".`;
const responseMessageIntro = `*Recorded data for system - `;
const responseMessageOutro = `\n\nIf the above information is incorrect, you may reply with "delete".\n`;

it('Should generate appropriate message if all values are null', () => {
  const emptyData = { temperature: null, humidity: null, ph: null, ec: null };
  expect(getResponseMessage(emptyData)).toBe(emptyDataReponse);
});

it('Should handle partial information', () => {
  expect(getResponseMessage({ temperature: 50 }, 'test')).toBe(responseMessageIntro + 'test:' + '*\n' + `\nTemperature: 50` + responseMessageOutro);
  expect(getResponseMessage({ temperature: 50, humidity: 20 }, 'test')).toMatch(
    responseMessageIntro + 'test:' + '*\n' + `\nTemperature: 50\nHumidity: 20` + responseMessageOutro
  );
});

it('Should handle full information submission', () => {
  expect(getResponseMessage({ temperature: 50, humidity: 20, ph: 5, ec: 10 }, 'test')).toBe(
    responseMessageIntro + 'test:' + '*\n' + `\nTemperature: 50\nHumidity: 20\nPh: 5\nEc: 10` + responseMessageOutro
  );
});
