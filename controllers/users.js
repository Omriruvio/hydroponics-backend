const bcrypt = require('bcryptjs');
const User = require('../models/user');
const parseCropData = require('../utils/parsecorpdata.js');
const getResponseMessage = require('../utils/response-text');
const { SID, AUTH_TOKEN, HYDROPONICS_WA_NUMBER, NODE_ENV } = process.env;
const client = require('twilio')(SID, AUTH_TOKEN);

const handleSignup = (req, res, next) => {
  const { email, password, phoneNumber, messageOptIn } = req.body;

  User.create({ email, phoneNumber })
    .then((user) => console.log(user))
    .catch((err) => {
      console.log(err.code);
      if (err.code === 11000) {
        if (NODE_ENV === 'DEV') {
          res.status(409).send({ message: 'User already exists.' });
        } else {
          res.status(400).send({ message: 'Error creating user.' });
        }
      }
      next(err);
    });

  // console.log('email', email);
  // console.log(password);

  // bcrypt
  //   .hash(password, 10)
  //   .then((hash) => {
  //     User.create({
  //       email,
  //       password: hash,
  //       // phoneNumber: phone,
  //       // messageOptIn,
  //     })
  //       .then((user) => {
  //         res.status(200).send({ email: user.email, id: user._id });
  //       })
  //       .catch(() => next(new Error('User already exists.')));
  //     // TODO: custom error & status codes
  //   })
  //   .catch(next);
};

const handleMobileSignup = (req, res, next) => {
  // todo: figure out a secure way that would not allow for
  // todo: submitting arbitrary number + email to this endpoint.
  const { email, phoneNumber } = req.body;
  console.log('received from mobile: ', email, phoneNumber);
  // todo: consider removing whatsapp: format from phone number
  User.create({ email, phoneNumber })
    .then((user) => {
      console.log('user created: ', user);
      res.status(200).send({ email: user.email, id: user._id });
    })
    .catch(() => next(new Error('User already exists.')));
  // TODO: custom error & status codes
};

const handleLogin = (req, res, next) => {
  const { email, phoneNumber } = req.body;
  User.findOne({ email })
    .orFail((err) => next(err))
    .then((user) => {
      // todo: consider adjusting phone number to whatsapp:+XXXYYYYYYY format
      // todo: or adjust db to store phone numbers without whatsap format
      console.log(String(user.phoneNumber).endsWith(String(+phoneNumber)));
      if (String(user.phoneNumber).endsWith(String(+phoneNumber))) {
        res.send({ id: user._id });
      } else {
        res.status(400).send({ message: 'Incorrect credentials.' });
      }
      // bcrypt
      //   .compare(password, user.password)
      //   .then((match) => {
      //     if (match) res.send({ id: user._id });
      //     else throw new Error('Access denied.');
      //     // TODO: custom error & status codes
      //   })
      //   .catch(next);
      // // TODO: custom error & status codes
    })
    .catch(next);
};

const handleCropData = (req, res, next) => {
  const { phoneNumber, messageBody, imageUrl } = req.body;
  const { temperature, humidity, ph, ec } = parseCropData(messageBody);
  // todo: if imageUrl exists in req.body -> confirmation message
  const responseMessage = imageUrl ? 'Image has been stored.' : getResponseMessage({ temperature, humidity, ph, ec });
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
          imageUrl,
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

const handleDeleteLast = (req, res, next) => {
  const { phoneNumber } = req.body;
  User.updateOne({ phoneNumber }, { $pop: { messageHistory: 1 } })
    .then((message) => {
      if (message.modifiedCount === 0) {
        const responseMessage = 'We have found nothing to delete.';
        client.messages
          .create({ from: HYDROPONICS_WA_NUMBER, to: phoneNumber, body: responseMessage })
          .then((message) => {
            res.setHeader('Content-type', 'text/csv');
            res.status(200).send(JSON.stringify({ message: responseMessage }));
          })
          .catch(next);
      } else {
        const responseMessage = 'Latest data submission has been deleted.';
        client.messages
          .create({ from: HYDROPONICS_WA_NUMBER, to: phoneNumber, body: responseMessage })
          .then((message) => {
            res.setHeader('Content-type', 'text/csv');
            res.status(200).send(JSON.stringify({ message: responseMessage }));
          })
          .catch(next);
      }
    })
    .catch(next);
};

const handleHelpRequest = (req, res, next) => {
  const { phoneNumber } = req.body;
  const responseMessage =
    `To submit crop data *respond with the following format:*\n` +
    `'*_temp_* value *_humidity_* value *_ph_* value *_ec_* value'\n` +
    `\n*Additional commands:*\n` +
    `*'help'* - For this reference sheet\n` +
    `*'delete'* - Remove latest crop data submission`;
  client.messages
    .create({ from: HYDROPONICS_WA_NUMBER, to: phoneNumber, body: responseMessage })
    .then((message) => {
      res.setHeader('Content-type', 'text/csv');
      res.status(200).send(JSON.stringify({ message: responseMessage }));
    })
    .catch(next);
};

module.exports = { handleHelpRequest, handleDeleteLast, handleSignup, handleLogin, handleMobileSignup, handleCropData };
