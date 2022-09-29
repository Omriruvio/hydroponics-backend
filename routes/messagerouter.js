const router = require('express').Router();
const auth = require('../middlewares/auth');
const { handleMessageUpdate, handleDeleteMessage } = require('../controllers/messages');

router.put('/update-message', auth, handleMessageUpdate);
router.delete('/delete-message', auth, handleDeleteMessage);

module.exports = router;
