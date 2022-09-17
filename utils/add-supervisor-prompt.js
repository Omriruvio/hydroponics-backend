const { addSupervisor } = require('./add-supervisor');
const mongoose = require('mongoose');

const prompt = require('prompt-sync')();
// todo- switch prompt-sync out for inquirer

const inputPhoneNumber = prompt('Phone number? ');
const inputEmail = prompt('Email? ');
const inputUsername = prompt('Username? ');
const inputPassword = prompt('Passowrd? ', { echo: '✅' });
const growersPhoneNumbers = prompt(`List of space separated phone numbers of growers to add (or all for all users) `);

mongoose.connect('mongodb://0.0.0.0:27017/hydroponics');

addSupervisor({
  email: inputEmail,
  growersNumbers: growersPhoneNumbers,
  password: inputPassword,
  phoneNumber: inputPhoneNumber,
  username: inputUsername,
})
  .then(() => {
    console.log('Done!');
  })
  .catch((err) => console.log(err))
  .finally(() => {
    mongoose.disconnect().then(() => console.log('Disconnected from database'));
  });
