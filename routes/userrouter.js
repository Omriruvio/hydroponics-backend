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
  setDefaultSystem,
} = require('../controllers/users');
const auth = require('../middlewares/auth');
const handleIfImage = require('../middlewares/check-for-image');
const setSelectedSystem = require('../middlewares/set-selected-system');
const selectDefaultSystem = require('../middlewares/select-default-system');
const router = require('express').Router();
const { verifyTwilioRequest } = require('../middlewares/validate-twilio-request');
const { getPlantHealth } = require('../utils/get-plant-health');
const isMobileRequest = require('../middlewares/is-mobile-request');
const createNewSystem = require('../middlewares/create-new-system');
const getUserSystems = require('../middlewares/get-user-systems');

// incoming web application requests
router.post('/register', handleSignup);
router.post('/login', handleLogin);
router.get('/history/:phone/:days/:systemId', handleHistoryRequest);
router.get('/me', auth, handleGetUser);
router.post('/new-system', handleNewSystem);
// get all user systems

// incoming requests from twilio studio
router.post('/identify', verifyTwilioRequest, handleTwilioAuth);
router.post(
  '/cropdata',
  verifyTwilioRequest,
  handleIfImage,
  getPlantHealth,
  createNewSystem,
  selectDefaultSystem,
  setSelectedSystem,
  getUserSystems,
  handleCropData
);
router.post('/delete-last', verifyTwilioRequest, handleDeleteLast);
router.post('/mobilesignup', verifyTwilioRequest, handleMobileSignup);
router.post('/help', verifyTwilioRequest, handleHelpRequest);

// requests that can come from either web application or twilio studio

// router.post(
//   '/set-default-system',
//   isMobileRequest,
//   (req, res, next) => req.isMobileRequest && verifyTwilioRequest(),
//   selectDefaultSystem,
//   setDefaultSystem
// );

module.exports = router;
