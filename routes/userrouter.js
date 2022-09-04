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

router.post('/identify', handleTwilioAuth);
router.post('/delete-last', handleDeleteLast);
router.post('/mobilesignup', handleMobileSignup);
router.post('/help', handleHelpRequest);
// router.post('/identify', twilio.webhook({ validate: shouldValidate, protocol: 'https' }), handleTwilioAuth);
// router.post('/delete-last', twilio.webhook({ validate: shouldValidate, protocol: 'https' }), handleDeleteLast);
// router.post('/mobilesignup', twilio.webhook({ validate: shouldValidate, protocol: 'https' }), handleMobileSignup);
// router.post('/help', twilio.webhook({ validate: shouldValidate, protocol: 'https' }), handleHelpRequest);

module.exports = router;
