const {
  handleHelpRequest,
  handleSignup,
  handleLogin,
  handleMobileSignup,
  handleCropData,
  handleDeleteLast,
  handleTwilioAuth,
  handleHistoryRequest,
} = require('../controllers/users');
const handleIfImage = require('../middlewares/check-for-image');
const router = require('express').Router();
const twilio = require('twilio');
const shouldValidate = process.env.NODE_ENV !== 'test';
// const authMiddleware = require('../middlewares/auth');
// const User = require('../models/user');
// const { SID, AUTH_TOKEN, HYDROPONICS_WA_NUMBER } = process.env;
// const client = require('twilio')(SID, AUTH_TOKEN);

router.post('/register', handleSignup);
router.post('/login', handleLogin);
router.post('/cropdata', handleIfImage, handleCropData);
router.get('/history/:phone/:days', handleHistoryRequest);
// incoming request from twilio flow authentication process

router.post('/identify', twilio.webhook({ validate: shouldValidate }), handleTwilioAuth);
router.post('/delete-last', twilio.webhook({ validate: shouldValidate }), handleDeleteLast);
router.post('/mobilesignup', twilio.webhook({ validate: shouldValidate }), handleMobileSignup);
router.post('/help', twilio.webhook({ validate: shouldValidate }), handleHelpRequest);

module.exports = router;
