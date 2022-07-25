const bcrypt = require('bcryptjs');
const User = require('../models/user');
const parseCropData = require('../utils/parsecorpdata.js');
const getResponseMessage = require('../utils/response-text');
const { SID, AUTH_TOKEN, HYDROPONICS_WA_NUMBER } = process.env;
const client = require('twilio')(SID, AUTH_TOKEN);

const handleSignup = (req, res, next) => {
  const { email, password, phone, messageOptIn } = req.body;
  console.log('email', email);
  console.log(password);

  bcrypt
    .hash(password, 10)
    .then((hash) => {
      User.create({
        email,
        password: hash,
        // phoneNumber: phone,
        // messageOptIn,
      })
        .then((user) => {
          res.status(200).send({ email: user.email, id: user._id });
        })
        .catch(() => next(new Error('User already exists.')));
      // TODO: custom error & status codes
    })
    .catch(next);
};

const handleMobileSignup = (req, res, next) => {
  // todo: figure out a secure way that would not allow for
  // todo: submitting arbitrary number + email to this endpoint.
  const { email, phoneNumber } = req.body;
  console.log('received from mobile: ', email, phoneNumber);
  User.create({ email, phoneNumber })
    .then((user) => {
      console.log('user created: ', user);
      res.status(200).send({ email: user.email, id: user._id });
    })
    .catch(() => next(new Error('User already exists.')));
  // TODO: custom error & status codes
};

const handleLogin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .select('password')
    .orFail((err) => next(err))
    .then((user) => {
      bcrypt
        .compare(password, user.password)
        .then((match) => {
          if (match) res.send({ id: user._id });
          else throw new Error('Access denied.');
          // TODO: custom error & status codes
        })
        .catch((err) => next(new Error('Access denied.')));
      // TODO: custom error & status codes
    })
    .catch(next);
};

const handleCropData = (req, res, next) => {
  const { phoneNumber, messageBody } = req.body;
  const { temperature, humidity, ph, ec } = parseCropData(messageBody);
  const responseMessage = getResponseMessage({ temperature, humidity, ph, ec });
  // todo: account for numeric data such as ec -> .55 & ph
  // todo: account for metric vs imperial system (FH / Celsius)
  User.findOneAndUpdate(
    { phoneNumber },
    {
      $push: {
        messageHistory: {
          dateReceived: new Date(),
          messageBody,
          temperature,
          humidity,
          ph,
          ec,
        },
      },
    },
    { new: true }
  )
    .orFail(() => next(new Error('User not found!')))
    .select('messageHistory')
    .then((history) => {
      client.messages
        .create({ from: HYDROPONICS_WA_NUMBER, to: phoneNumber, body: responseMessage })
        .then((message) => {
          res.setHeader('Content-type', 'text/csv');
          res.status(200).send(JSON.stringify({ message: responseMessage }));
        })
        .catch(next);
    })
    .catch(next);
};

module.exports = { handleSignup, handleLogin, handleMobileSignup, handleCropData };
