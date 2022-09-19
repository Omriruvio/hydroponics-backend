const router = require('express').Router();
const { addUserToSystem, removeUserFromSystem, getSystemUsers, renameSystem } = require('../controllers/systems');
const { verifyTwilioRequest } = require('../middlewares/validate-twilio-request');

router.post('/add-user-to-system', addUserToSystem);
router.delete('/remove-user-from-system', removeUserFromSystem);
router.get('/get-system-users/:systemId', getSystemUsers);

// mobile interface routes
router.post('/system/rename', verifyTwilioRequest, renameSystem);

module.exports = router;
