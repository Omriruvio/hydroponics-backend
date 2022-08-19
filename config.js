const { DAYS } = require('./constants');

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
  `'*_temp_* value *_humidity_* value *_ph_* value *_ec_* value'\n` +
  `\n*Additional commands:*\n` +
  `*'help'* - For this reference sheet\n` +
  `*'delete'* - Remove latest crop data submission`;
