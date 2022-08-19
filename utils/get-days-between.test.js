const { getDaysBetween } = require('./get-days-between');

it('Should return an absolute number representing the amount of days passed between two dates', () => {
  expect(getDaysBetween(new Date(2019, 7, 15), new Date(2022, 7, 18))).toBe(1099);
  expect(getDaysBetween(new Date(2022, 7, 18), new Date(2019, 7, 15))).toBe(1099);
  expect(getDaysBetween(null, new Date(2019, 7, 15))).toBe(0);
});
