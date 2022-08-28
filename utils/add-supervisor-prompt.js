const { addSupervisor } = require('./add-supervisor');
const mongoose = require('mongoose');
const { MONGODB_URI } = process.env;

const prompt = require('prompt-sync')();
// todo- switch prompt-sync out for inquirer

const inputPhoneNumber = prompt('Phone number? ');
const inputEmail = prompt('Email? ');
const inputUsername = prompt('Username? ');
const inputPassword = prompt('Passowrd? ', { echo: '✅' });
const growersPhoneNumbers = prompt(`List of space separated phone numbers of growers to add (or all for all users) `);

mongoose.connect(MONGODB_URI);

addSupervisor({
  email: inputEmail,
  growersNumbers: growersPhoneNumbers,
  password: inputPassword,
  phoneNumber: inputPhoneNumber,
  username: inputUsername,
})
  .catch((err) => console.log(err))
  .finally(() => mongoose.disconnect());
