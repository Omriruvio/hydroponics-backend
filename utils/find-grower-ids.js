const user = require('../models/user');

/**
 * receives array of phone numbers or space separated string of phone numbers and returns array of mongoDB id's
 * @param {string[] | string} phoneNumbers
 * @returns Promisified array of mongoDB id's
 */
const findGrowerIds = async (phoneNumbers) => {
  if (phoneNumbers === 'all') {
    const allUsers = await user.find({}).select('_id');
    return allUsers;
  }
  const numbersArray = Array.isArray(phoneNumbers) ? phoneNumbers : phoneNumbers.split(' ');
  if (!phoneNumbers || phoneNumbers.length === 0) return [];
  const requests = numbersArray.map((number) => {
    return user
      .findOne({ phoneNumber: `whatsapp:+972${+number}` })
      .select('_id')
      .orFail(() => console.log('user not found'));
  });
  const ids = await Promise.all(requests);
  return ids;
};

module.exports = { findGrowerIds };
