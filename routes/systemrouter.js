const router = require('express').Router();
const { addUserToSystem, removeUserFromSystem, getSystemUsers, renameSystem, setSystemPublic, setSystemPrivate } = require('../controllers/systems');
const { verifyTwilioRequest } = require('../middlewares/validate-twilio-request');

router.post('/add-user-to-system', addUserToSystem);
router.delete('/remove-user-from-system', removeUserFromSystem);
router.get('/get-system-users/:systemId', getSystemUsers);

// mobile interface routes
router.post('/system/mobile/rename', verifyTwilioRequest, renameSystem);
router.post('/system/mobile/set-public', verifyTwilioRequest, setSystemPublic);
router.post('/system/mobile/set-private', verifyTwilioRequest, setSystemPrivate);

module.exports = router;
