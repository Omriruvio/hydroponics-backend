const { handleHelpRequest, handleSignup, handleLogin, handleMobileSignup, handleCropData, handleDeleteLast } = require('../controllers/users');
const authMiddleware = require('../middlewares/auth');
const handleIfImage = require('../middlewares/check-for-image');
const User = require('../models/user');
const router = require('express').Router();
const { SID, AUTH_TOKEN, HYDROPONICS_WA_NUMBER } = process.env;
const client = require('twilio')(SID, AUTH_TOKEN);

router.post('/register', handleSignup);
router.post('/login', handleLogin);
// incoming request from twilio flow authentication process
router.post('/identify', authMiddleware, (req, res, next) => {
  // receives body.phoneNumber
  // if match - should respond with 202 for processing incoming crop data
  // if no match - should response with a 400 unauthorized to trigger
  // prompt for signup process
  const { phoneNumber } = req.body;
  User.findOne({ phoneNumber })
    .then((foundUser) => {
      if (!foundUser) {
        res.status(204).send();
        return;
      } else {
        res.status(202).send({ user: foundUser });
      }
    })
    .catch(next);
});
router.post('/delete-last', handleDeleteLast);

router.post('/cropdata', handleIfImage, handleCropData);

router.post('/mobilesignup', handleMobileSignup);

router.post('/help', handleHelpRequest);

router.get('/history/:days', (req, res, next) => {
  //expects phoneNumber in the format of 'whatsapp:+972xxxxxxxxx'
  const { phoneNumber } = req.body;
  const dayCount = req.params.days;
  const toDate = Date.now();
  User.getMessageHistoryFrom(phoneNumber, toDate, dayCount)
    .then((history) => res.send(history))
    .catch(next);
});

module.exports = router;
