const router = require('express').Router();
const {
  addUserToSystem,
  removeUserFromSystem,
  getSystemUsers,
  renameSystem,
  setSystemPublic,
  setSystemPrivate,
  getSystem,
  webRenameSystem,
  webSetSystemAccess,
  createSystem,
} = require('../controllers/systems');
const auth = require('../middlewares/auth');
const { verifyTwilioRequest } = require('../middlewares/validate-twilio-request');

router.post('/add-user-to-system', addUserToSystem);
router.delete('/remove-user-from-system', removeUserFromSystem);
router.get('/get-system-users/:systemId', getSystemUsers);
router.get('/system/get', getSystem);
router.patch('/system/:systemId', auth, webRenameSystem);
router.patch('/system/set-access/:systemId', auth, webSetSystemAccess);
router.post('/system/create', auth, createSystem);

// mobile interface routes
router.post('/system/mobile/rename', verifyTwilioRequest, renameSystem);
router.post('/system/mobile/set-public', verifyTwilioRequest, setSystemPublic);
router.post('/system/mobile/set-private', verifyTwilioRequest, setSystemPrivate);

module.exports = router;
