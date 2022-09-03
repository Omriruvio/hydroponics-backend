const bcrypt = require('bcryptjs');
const { DEFAULT_HELP_MESSAGE } = require('../config');
const User = require('../models/user');
const parseCropData = require('../utils/parsecorpdata.js');
const getResponseMessage = require('../utils/response-text');
const { SID, AUTH_TOKEN, HYDROPONICS_WA_NUMBER, NODE_ENV } = process.env;
const client = require('twilio')(SID, AUTH_TOKEN);

const handleSignup = (req, res, next) => {
  const { email, phoneNumber, username } = req.body;

  User.create({ email, phoneNumber, username })
    .then((user) => {
      res.status(201).send({ message: 'User created successfully.' });
    })
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
};

const handleMobileSignup = (req, res, next) => {
  const { email, phoneNumber, whatsappName } = req.body;
  // todo: consider removing whatsapp: format from phone number
  User.create({ email, phoneNumber, username: whatsappName })
    .then((user) => {
      res.status(200).send({ email: user.email, id: user._id });
    })
    .catch(() => next(new Error('User already exists.')));
  // TODO: custom error & status codes
};

const handleLogin = (req, res, next) => {
  const { email, phoneNumber } = req.body;
  User.findOne({ email })
    .orFail((err) => {
      throw new Error('User not found');
    })
    .then((user) => {
      // todo: consider adjusting phone number to whatsapp:+XXXYYYYYYY format
      // todo: or adjust db to store phone numbers without whatsap format
      if (String(user.phoneNumber).endsWith(String(+phoneNumber))) {
        res.send({ id: user._id });
      } else {
        res.status(400).send({ message: 'Incorrect credentials.' });
      }
    })
    .catch((err) => {
      if (err.message === 'User not found') {
        res.status(400).send({ message: 'Incorrect credentials.' });
      } else {
        next(err);
      }
    });
};

const handleTwilioAuth = (req, res, next) => {
  // receives body.phoneNumber
  // if match - should respond with 202 for processing incoming crop data
  // if no match - should response with a 204 no content to trigger
  // Warning: Status codes are corresponding to twilio hooks do not change without proper care.
  // prompt for signup process
  const { phoneNumber } = req.body;
  User.findOne({ phoneNumber })
    .then((foundUser) => {
      if (!foundUser) {
        res.status(204).send();
        return;
      } else {
        User.setLastInteraction(phoneNumber);
        res.status(202).send({ user: foundUser });
      }
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
      if (NODE_ENV === 'test') {
        res.send({ status: 'ok', message: 'Test crop data processed.' });
        return;
      }
      client.messages
        .create({
          from: HYDROPONICS_WA_NUMBER,
          to: phoneNumber,
          body: responseMessage,
        })
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
      if (NODE_ENV === 'test') {
        res.send({ status: 'ok', message: 'Delete request received.' });
        return;
      }
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
  const responseMessage = DEFAULT_HELP_MESSAGE;
  if (NODE_ENV === 'test') {
    res.send({ status: 'ok', message: DEFAULT_HELP_MESSAGE });
    return;
  }
  client.messages
    .create({ from: HYDROPONICS_WA_NUMBER, to: phoneNumber, body: responseMessage })
    .then((message) => {
      res.setHeader('Content-type', 'text/csv');
      res.status(200).send(JSON.stringify({ message: responseMessage }));
    })
    .catch(next);
};

const handleHistoryRequest = (req, res, next) => {
  //expects phoneNumber in the format of 'whatsapp:+972xxxxxxxxx'
  const phoneNumber = req.params.phone;
  const isWhatsappNumber = phoneNumber.startsWith('whatsapp:');
  const whatsappConvertedNumber = isWhatsappNumber ? phoneNumber : `whatsapp:+972${String(+phoneNumber)}`;
  const dayCount = req.params.days;
  const toDate = new Date();
  User.getMessageHistoryFrom(whatsappConvertedNumber, toDate, dayCount)
    .then((history) => {
      res.send(history);
    })
    .catch(next);
};

module.exports = {
  handleHistoryRequest,
  handleTwilioAuth,
  handleHelpRequest,
  handleDeleteLast,
  handleSignup,
  handleLogin,
  handleMobileSignup,
  handleCropData,
};
