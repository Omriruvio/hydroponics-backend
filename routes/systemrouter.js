const router = require('express').Router();
const { addUserToSystem, removeUserFromSystem, getSystemUsers } = require('../controllers/systems');

router.post('/add-user-to-system', addUserToSystem);
router.delete('/remove-user-from-system', removeUserFromSystem);
router.get('/get-system-users/:systemId', getSystemUsers);

module.exports = router;
