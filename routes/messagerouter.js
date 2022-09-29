const router = require('express').Router();
const auth = require('../middlewares/auth');
const { handleMessageUpdate } = require('../controllers/messages');

router.put('/update-message', auth, handleMessageUpdate);

module.exports = router;
