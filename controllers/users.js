const bcrypt = require('bcryptjs');
const { DEFAULT_HELP_MESSAGE } = require('../config');
const User = require('../models/user');
const Message = require('../models/message');
const { getImageResponseMessage } = require('../utils/get-image-response-message');
const parseCropData = require('../utils/parsecorpdata.js');
const getResponseMessage = require('../utils/response-text');
const { TWILIO_SID, TWILIO_AUTH_TOKEN, HYDROPONICS_WA_NUMBER, NODE_ENV, JWT_SECRET } = process.env;
const client = require('twilio')(TWILIO_SID, TWILIO_AUTH_TOKEN);
const jwt = require('jsonwebtoken');
const System = require('../models/system');
const { sendWhatsappMessage } = require('../utils/send-twilio-message');

const handleSignup = (req, res, next) => {
  // todo - make frontend force submitting username
  const { email, phoneNumber, username = 'user' } = req.body;

  User.create({ email, phoneNumber, username })
    .then((user) => {
      res.status(201).send({ message: 'User created successfully.', userId: user._id });
    })
    .catch((err) => {
      if (err.code === 11000) {
        res.status(409).send({ message: 'User already exists.' });
      } else next(err);
    });
};

const handleMobileSignup = (req, res, next) => {
  const { email, phoneNumber, whatsappName } = req.body;
  // todo: consider removing whatsapp: format from phone number
  User.create({ email: email.toLowerCase(), phoneNumber, username: whatsappName })
    .then((user) => {
      res.status(200).send({ email: user.email, id: user._id });
    })
    .catch(() => next(new Error('User already exists.')));
  // TODO: custom error & status codes
};

const handleGetUser = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .orFail(() => res.status(404).send({ message: 'User not found' }))
    .then((user) => {
      res.send(user);
    })
    .catch(next);
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
        const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
        res.send({ token });
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

// controller for adding provided crop data to the specified system, if no system name is specified,
// the data is added to the user's default system.
// if a default system does not exist, a new one is created.
// also sends a response message generated by either getImageResponseMessage or getResponseMessage

const handleCropData = async (req, res, next) => {
  try {
    const selectedSystemId = req.selectedSystem;
    const { phoneNumber, messageBody, imageUrl, plantHealth /* , systemName */ } = req.body;
    const { temperature, humidity, ph, ec } = parseCropData(messageBody);
    const { responseMessage: imageResponseMessage, healthState } = getImageResponseMessage(plantHealth);
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      res.status(204).send();
      return;
    }
    const messageData = { temperature, humidity, ph, ec, imageUrl, healthState, messageBody, user: user._id };

    // const systemId = systemName ? user.systems.find((system) => system.name === systemName)._id : user.defaultSystem ? user.defaultSystem._id : (await System.createSystem(user._id)._id);
    let systemId;
    if (selectedSystemId) systemId = selectedSystemId;
    if (!systemId && user.defaultSystem) systemId = String(user.defaultSystem);
    if (!systemId) {
      console.log('creating default system for user name: ', user.username, 'user id: ', user._id);
      const system = await System.createSystem(user._id, 'default');
      systemId = system._id;
      await User.findByIdAndUpdate(user._id, { defaultSystem: systemId });
    }
    const systemName = await System.findById(systemId).then((system) => system.name);
    const responseMessage = imageUrl ? imageResponseMessage : getResponseMessage({ temperature, humidity, ph, ec }, systemName);

    // create message in the message collection
    const message = await Message.addMessage(messageData, systemId);
    // add message to the system
    await System.addCropData(systemId, message._id);
    // add message to the user
    await User.addMessage(user._id, message._id);

    await User.setLastInteraction(phoneNumber);
    if (NODE_ENV === 'test') {
      res.send({ status: 'ok', message: 'Test crop data processed.', messageId: message._id });
      return;
    }

    await sendWhatsappMessage(phoneNumber, responseMessage);
    res.status(200).send({ responseMessage });
  } catch (err) {
    next(err);
  }
};

const handleDeleteLast = async (req, res, next) => {
  // finds the latest message sent by the user in the messages collection
  // if NODE_ENV is test, returns a 200 status code and a message after deleting the last entry
  // if NODE_ENV is not test, sends a twilio whatsapp message to the user and returns a 200 status code
  // if modifiedCount is 0, returns a 204 status code and a message saying "We have found nothing to delete."
  // if a message was successfully deleted and NODE_ENV is not test, returns a 200 status code and a message saying "Your last message was deleted."
  try {
    const { phoneNumber } = req.body;
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(204).send({ message: 'User not found' });

    const deletedMessage = await Message.deleteLastMessage(user._id);
    if (!deletedMessage) {
      sendWhatsappMessage(phoneNumber, 'We have found nothing to delete.');
      return res.status(204).send({ message: 'We have found nothing to delete.' });
    }

    // remove the message from the user's messages array & the system's messages array
    await User.deleteMessage(user._id, deletedMessage._id);
    await System.deleteMessage(deletedMessage.system, deletedMessage._id);

    if (NODE_ENV === 'test') {
      res.send({ status: 'ok', message: 'Test last message deleted.' });
      return;
    }

    // make a messageResponseSuffix variable containing either deletedMessage.messageBody if it exists or deletedMessage.imageUrl if it exists otherwise an empty string
    let messageResponseSuffix = '';
    if (deletedMessage.messageBody) messageResponseSuffix = deletedMessage.messageBody;
    if (deletedMessage.imageUrl) messageResponseSuffix = deletedMessage.imageUrl;

    await sendWhatsappMessage(phoneNumber, 'Your last message was deleted. \n' + messageResponseSuffix);
    res.status(200).send({ message: 'Your last message was deleted.' });
  } catch (err) {
    next(err);
  }
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
  const dayCount = req.params.days;
  const systemId = req.params.systemId === 'undefined' ? undefined : req.params.systemId;
  const isWhatsappNumber = phoneNumber.startsWith('whatsapp:');
  const whatsappConvertedNumber = isWhatsappNumber ? phoneNumber : `whatsapp:+972${String(+phoneNumber)}`;
  const toDate = new Date();
  // receives whatsapp number, to date, number of days to go back, and optional systemId (otherwise defaults to default system)
  User.getMessageHistoryFrom(whatsappConvertedNumber, toDate, dayCount, systemId)
    .then((history) => {
      if (history.length === 0) res.status(204).send();
      else res.send(history);
    })
    .catch(next);
};

const handleNewSystem = async (req, res, next) => {
  const phoneNumber = req.body.phoneNumber || req.whatsappPhoneNumber;
  const systemName = req.body.systemName?.toLowerCase() || req.systemName?.toLowerCase();
  const user = await User.findOne({ phoneNumber });
  if (!user) {
    res.status(204).send();
    return;
  }
  const system = await System.createSystem(user._id, systemName);
  await User.addSystem(user._id, system._id);
  if (req.isMobileRequest) sendWhatsappMessage(phoneNumber, `System ${system.name} created.`);
  res.status(200).send({ systemId: system._id });
};

const setDefaultSystem = async (req, res, next) => {
  // expects phoneNumber and systemId in the body
  const phoneNumber = req.body.phoneNumber || req.whatsappPhoneNumber;
  const systemId = req.body.systemId || req.systemId;
  await User.setDefaultSystem(phoneNumber, systemId);
  if (req.isMobileRequest) sendWhatsappMessage(phoneNumber, 'Default system set.');
  res.status(200).send({ message: 'Default system set.' });
};

const getAllUserSystems = async (req, res, next) => {
  // expects phoneNumber in the body
  const phoneNumber = req.body.phoneNumber || req.whatsappPhoneNumber;
  const user = await User.findOne({ phoneNumber });
  if (!user) return res.status(204).send({ message: 'User not found' });
  const systems = await System.find({ _id: { $in: user.systems } });
  res.status(200).send({ systems });
};

// Whatsapp interface:
// - user sends 'system <name> <cropdata>'
// - user sends 'default system <system-name>'
// - user receives link to add a system to his list of systems

module.exports = {
  handleHistoryRequest,
  handleTwilioAuth,
  handleHelpRequest,
  handleDeleteLast,
  handleSignup,
  handleLogin,
  handleMobileSignup,
  handleCropData,
  handleGetUser,
  handleNewSystem,
  setDefaultSystem,
  getAllUserSystems,
};