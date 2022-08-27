const supervisor = require('../models/supervisor');
const mongoose = require('mongoose');
require('dotenv').config();
const { MONGODB_URI } = process.env;
const bcrypt = require('bcryptjs');
const user = require('../models/user');
const prompt = require('prompt-sync')();

const findGrowerIds = async (phoneNumberArray) => {
  if (!phoneNumberArray || phoneNumberArray.length === 0) return [];
  const requests = phoneNumberArray.split(' ').map((number) => {
    return user.findOne({ phoneNumber: `whatsapp:+972${+number}` }).orFail(() => console.log('user not found'));
  });
  const ids = await Promise.all(requests);
  return ids;
};

async function run() {
  await mongoose.connect(MONGODB_URI);

  const inputPhoneNumber = prompt('Phone number? ');
  const inputEmail = prompt('Email? ');
  const inputUsername = prompt('Username? ');
  const inputPassword = prompt('Passowrd? ', { echo: '✅' });
  const growersPhoneNumbers = prompt(`List phone numbers of growers to add (space separated) `);

  const growerIds = await findGrowerIds(growersPhoneNumbers);

  const encryptedPassword = await bcrypt.hash(inputPassword, 10);

  const supervisorToAdd = {
    phoneNumber: `whatsapp:+972${+inputPhoneNumber}`,
    email: inputEmail,
    username: inputUsername,
    password: encryptedPassword,
    users: growerIds,
  };

  const admin = new supervisor(supervisorToAdd);
  await admin.save();
}

run()
  .catch((err) => console.log(err))
  .finally(() => mongoose.disconnect());
