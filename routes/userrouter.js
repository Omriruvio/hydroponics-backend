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
const authMiddleware = require('../middlewares/auth');
const handleIfImage = require('../middlewares/check-for-image');
const User = require('../models/user');
const router = require('express').Router();
const { SID, AUTH_TOKEN, HYDROPONICS_WA_NUMBER } = process.env;
const client = require('twilio')(SID, AUTH_TOKEN);

router.post('/register', handleSignup);
router.post('/login', handleLogin);
// incoming request from twilio flow authentication process
router.post('/identify', handleTwilioAuth);

router.post('/cropdata', handleIfImage, handleCropData);
router.post('/delete-last', handleDeleteLast);

router.post('/mobilesignup', handleMobileSignup);

router.post('/help', handleHelpRequest);

router.get('/history/:phone/:days', handleHistoryRequest);

module.exports = router;
