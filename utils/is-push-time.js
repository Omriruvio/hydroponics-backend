const moment = require('moment');
const { PUSH_MIN_UTC_HOUR, PUSH_MAX_UTC_HOUR, PUSH_MIN_WEEK_DAY, PUSH_MAX_WEEK_DAY } = require('../config');

const isPushTimeEligible = () => {
  const today = moment().utc().day();
  const currentUtcTime = moment().utc().hour();
  // prettier-ignore
  if (
    currentUtcTime < PUSH_MIN_UTC_HOUR ||
    currentUtcTime > PUSH_MAX_UTC_HOUR ||
    today < PUSH_MIN_WEEK_DAY ||
    today > PUSH_MAX_WEEK_DAY) {
    return false;
  } else {
    return true;
  }
};

module.exports = isPushTimeEligible;
