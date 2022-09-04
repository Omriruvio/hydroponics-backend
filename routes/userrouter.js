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
const { verifyTwilioRequest } = require('../middlewares/validate-twilio-request');

// incoming web application requests
router.post('/register', handleSignup);
router.post('/login', handleLogin);
router.post('/cropdata', handleIfImage, handleCropData);
router.get('/history/:phone/:days', handleHistoryRequest);

// incoming requests from twilio studio
router.post('/identify', verifyTwilioRequest, handleTwilioAuth);
router.post('/delete-last', verifyTwilioRequest, handleDeleteLast);
router.post('/mobilesignup', verifyTwilioRequest, handleMobileSignup);
router.post('/help', verifyTwilioRequest, handleHelpRequest);

module.exports = router;
