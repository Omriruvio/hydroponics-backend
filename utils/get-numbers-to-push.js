// select users who have not sent a message for a week
// select users who are set to receiveReminders === true
// select users who's lastReceivedPush is > than 7 days ago
// return selected users (those who should receive the push)
// todo: consider increasing push interval by applying 7 days * pushNotificationsSent + 1
// todo: this will increase the interval of pushing each time

const { PUSH_MIN_DELAY_DAYS } = require('../config');
const { getDaysBetween } = require('./get-days-between');

/**
 * Receives an array of user documents and returns an array of usernames & numbers to push-notify
 * @param {Array<{username: String, phoneNumber: String, receiveReminders: Boolean, lastInteraction: Date, lastReceivedPush: Date, messageHistory: Array<{dateReceived: Date}>}>} users
 * @returns {Array<{phoneNumber: String, username: String}>} Array of phone numbers to push-notify
 */
module.exports.getNumbersToPush = (users) => {
  const now = new Date();
  return users.reduce((numbersToNotify, user) => {
    const acceptsReminders = user.receiveReminders;
    const lastReceivedPush = user.lastReceivedPush;
    const delayHasPassed = lastReceivedPush ? getDaysBetween(lastReceivedPush, now) >= PUSH_MIN_DELAY_DAYS : true;
    const lastSentMessage = user.messageHistory.at(-1);
    let isInactive;
    if (!lastSentMessage) isInactive = true;
    else {
      const lastSentMessageTime = lastSentMessage.dateReceived || null;
      isInactive = getDaysBetween(lastSentMessageTime, now) >= PUSH_MIN_DELAY_DAYS;
    }
    if (acceptsReminders && delayHasPassed && isInactive) {
      numbersToNotify.push({ phoneNumber: user.phoneNumber, username: user.username || 'user' });
    }
    return numbersToNotify;
  }, []);
};
