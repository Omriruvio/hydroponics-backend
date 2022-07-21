const parseCropData = require('./parsecorpdata');

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
  expect(parseCropData(messages[0])).toHaveProperty('temperature');
  expect(parseCropData(messages[0])).toHaveProperty('humidity');
  expect(parseCropData(messages[0])).toHaveProperty('ec');
  expect(parseCropData(messages[0])).toHaveProperty('ph');
});

it('Should process simple input', () => {
  expect(parseCropData(messages[0])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should handle whitespace', () => {
  expect(parseCropData(messages[1])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should handle capitalization', () => {
  expect(parseCropData(messages[2])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should ignore invalid input', () => {
  expect(parseCropData(messages[3])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should process mixed input', () => {
  expect(parseCropData(messages[4])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should handle incosistent spacing', () => {
  expect(parseCropData(messages[5])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should handle negative values and floats', () => {
  expect(parseCropData(messages[6])).toMatchObject({ temperature: -50, ec: -10, ph: 5.05, humidity: 40.05 });
});

it('Should handle return null when values are missing', () => {
  expect(parseCropData(messages[7])).toMatchObject({ temperature: null, ec: null, ph: 5.05, humidity: 40.05 });
});

it('Should resolve repeated values by the first one', () => {
  expect(parseCropData(messages[8])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should resolve handle varous separators', () => {
  expect(parseCropData(messages[9])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
  expect(parseCropData(messages[10])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

it('Should return all properties as null on null/undefined/empty input', () => {
  expect(parseCropData(messages[11])).toMatchObject({ temperature: null, ec: null, ph: null, humidity: null });
  expect(parseCropData(messages[12])).toMatchObject({ temperature: null, ec: null, ph: null, humidity: null });
  expect(parseCropData(messages[13])).toMatchObject({ temperature: null, ec: null, ph: null, humidity: null });
});

it("Should handle lazy people's input", () => {
  expect(parseCropData(messages[14])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
});

// it('Should allow for key-separator-value structure', () => {
//   expect(parseCropData(messages[15])).toMatchObject({ temperature: 50, ec: 10, ph: 5, humidity: 40 });
// });
