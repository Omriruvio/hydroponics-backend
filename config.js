const { DAYS } = require('./constants');

// configuration for min/max hours and days of the week to push notifications for inactivity
module.exports.PUSH_MIN_UTC_HOUR = 11;
module.exports.PUSH_MAX_UTC_HOUR = 18;
module.exports.PUSH_MIN_WEEK_DAY = DAYS.MON;
module.exports.PUSH_MAX_WEEK_DAY = DAYS.THU;

// important!
// Make sure to adjust PUSH_MIN_DELAY_PERIOD_TEXT to correspond to this value
module.exports.PUSH_MIN_DELAY_DAYS = 7;

// Important!
// below applies to push notfication message text 'you have not sent your crop data this <...>'
module.exports.PUSH_MIN_DELAY_PERIOD_TEXT = 'week';

module.exports.ERROR_LOG_PATH = '/logs/error.log';

module.exports.DEFAULT_HELP_MESSAGE =
  `To submit crop data *respond with the following format:*\n` +
  `'*_temp_* value *_ph_* value *_ec_* value'\n\n` +
  `You may send photos of your crop which will be analyzed and provide instant feedback regarding health, deficiencies and pest presence.\n` +
  `\n*Additional commands:*\n` +
  `*'help'* - For this reference sheet\n` +
  `*'dash/dashboard'* - Provides a link to your dashboard\n` +
  `*'delete'* - Remove latest crop data submission\n` +
  `*'system <system-name> <data>'* - Submit crop data for a specific system\n`;

module.exports.PROBABILITY = {
  VERY_LOW: 0.25,
  LOW: 0.5,
  HIGH: 0.75,
};

module.exports.EMOJI = {
  GOOD: '✅',
  NEUTRAL: '⚠️',
  WARNING: '⛔',
};
