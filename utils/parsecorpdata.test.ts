const parseData = require('./parsecorpdata');

const messages = [
  't 50 ec 10 ph 5 humidity 40',
  '  temp50   ec 10 ph 5 humidity 40  ',
  'teMp 50 eC 10 ph 5 humidity 40',
  'temp 50 ec 10 ph 5 humidity 40 something 2000',
  't 50 ec 10 ph 5 something 2000 hum40 ',
  'tmp50ec10ph 5something 2000 hum40 ',
  'tmp-50ec -10ph 5.05something 2000 hum40.050 ',
  'ph 5.05something 2000 h40.050 ',
  't 50 ec 10 ph 5 humidity 40 temperature 150',
  't 50 // ec 10 -- ph 5 - humidity 40',
  't 50 *   ec 10  @ p 5 ... humidity 40',
  null,
  undefined,
  '',
  't50e10p5h40',
  // 't : 50 ec : 10 ph : 5 humidity 40',
];

it('Should have all properties in parsed object', () => {
  expect(parseData(messages[0])).toHaveProperty('temperature');
  expect(parseData(messages[0])).toHaveProperty('humidity');
  expect(parseData(messages[0])).toHaveProperty('ec');
  expect(parseData(messages[0])).toHaveProperty('ph');
});

it('Should process simple input', () => {
  expect(parseData(messages[0])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should handle whitespace', () => {
  expect(parseData(messages[1])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should handle capitalization', () => {
  expect(parseData(messages[2])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should ignore invalid input', () => {
  expect(parseData(messages[3])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should process mixed input', () => {
  expect(parseData(messages[4])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should handle incosistent spacing', () => {
  expect(parseData(messages[5])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should handle negative values and floats', () => {
  expect(parseData(messages[6])).toMatchObject({ temperature: -50, ec: -10, ph: 5.05, humidity: 40.05 });
});

it('Should handle return null when values are missing', () => {
  expect(parseData(messages[7])).toMatchObject({ temperature: null, ec: null, ph: 5.05, humidity: 40.05 });
});

it('Should resolve repeated values by the first one', () => {
  expect(parseData(messages[8])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should resolve handle varous separators', () => {
  expect(parseData(messages[9])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
  expect(parseData(messages[10])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should return all properties as null on null/undefined/empty input', () => {
  expect(parseData(messages[11])).toMatchObject({ temperature: null, ec: null, ph: null, humidity: null });
  expect(parseData(messages[12])).toMatchObject({ temperature: null, ec: null, ph: null, humidity: null });
  expect(parseData(messages[13])).toMatchObject({ temperature: null, ec: null, ph: null, humidity: null });
});

it("Should handle lazy people's input", () => {
  expect(parseData(messages[14])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

// it('Should allow for key-separator-value structure', () => {
//   expect(parseData(messages[15])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
// });
