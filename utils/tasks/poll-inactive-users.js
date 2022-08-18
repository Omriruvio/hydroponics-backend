const { ToadScheduler, SimpleIntervalJob, AsyncTask } = require('toad-scheduler');
const User = require('../../models/user');
const logError = require('../errors/log-error');
const { getFormattedPushMessage } = require('../get-formatted-push-message');
const { getNumbersToPush } = require('../get-numbers-to-push');
const isPushTimeEligible = require('../is-push-time');
const { SID, AUTH_TOKEN, HYDROPONICS_WA_NUMBER, NODE_ENV } = process.env;
const client = require('twilio')(SID, AUTH_TOKEN);

// schedules interval for requesting periodical data
scheduler = new ToadScheduler();
const task = new AsyncTask(
  'simple task',
  () => {
    // only execute between hours set in /config.js
    // and between monday - thursday
    if (!isPushTimeEligible()) {
      return Promise.reject({ timeBoundaryRejection: true });
    }
    // todo: consider increasing push interval by applying 7 days * pushNotificationsSent + 1
    // todo: this will increase the interval of pushing each time
    return User.find({}).then((users) => {
      const pushMessage = getFormattedPushMessage();
      try {
        getNumbersToPush(users).forEach((phoneNumber) => {
          // send push notification
          console.log(phoneNumber);
          client.messages.create({ from: HYDROPONICS_WA_NUMBER, to: phoneNumber, body: pushMessage }).then((message) => {
            console.log('Message sent.');
            User.findOneAndUpdate({ phoneNumber }, { lastReceivedPush: new Date() }, { new: true, upsert: true }).then((user) => {
              // console.log('User document has been updated: ', user);
            });
          });
          // send message and add to successfullyPushedNumbers in the then block
        });
      } catch (err) {
        logError(err);
      }
    });
  },
  (err) => {
    if (err.timeBoundaryRejection) return;
    logError(err);
  }
);
// set to check every two hours
const pollForPushNotification = new SimpleIntervalJob({ seconds: 60, runImmediately: true }, task);

module.exports = { scheduler, pollForPushNotification };
