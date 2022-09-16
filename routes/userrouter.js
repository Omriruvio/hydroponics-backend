const {
  handleHelpRequest,
  handleSignup,
  handleLogin,
  handleMobileSignup,
  handleCropData,
  handleDeleteLast,
  handleTwilioAuth,
  handleHistoryRequest,
  handleGetUser,
  handleNewSystem,
} = require('../controllers/users');
const auth = require('../middlewares/auth');
const handleIfImage = require('../middlewares/check-for-image');
const router = require('express').Router();
const { verifyTwilioRequest } = require('../middlewares/validate-twilio-request');
const { getPlantHealth } = require('../utils/get-plant-health');

// incoming web application requests
router.post('/register', handleSignup);
router.post('/login', handleLogin);
router.get('/history/:phone/:days', handleHistoryRequest);
router.get('/me', auth, handleGetUser);
router.post('/new-system', handleNewSystem);


// incoming requests from twilio studio
router.post('/identify', verifyTwilioRequest, handleTwilioAuth);
router.post('/cropdata', verifyTwilioRequest, handleIfImage, getPlantHealth, handleCropData);
router.post('/delete-last', verifyTwilioRequest, handleDeleteLast);
router.post('/mobilesignup', verifyTwilioRequest, handleMobileSignup);
router.post('/help', verifyTwilioRequest, handleHelpRequest);

module.exports = router;
