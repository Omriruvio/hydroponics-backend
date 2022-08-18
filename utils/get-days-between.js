/**
 * @param {Date} date1
 * @param {Date} date2
 * @returns {number} Absolute number representing the amount of days between the two dates
 */
module.exports.getDaysBetween = (date1, date2) => {
  if (!date1 || !date2) return 0;
  return Math.abs(date1 - date2) / 1000 / 60 / 60 / 24;
};
