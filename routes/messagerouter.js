const router = require('express').Router();
const auth = require('../middlewares/auth');
const { handleMessageUpdate, handleDeleteMessage, getLastXMessagesWithPhoto, getAverageMetrics } = require('../controllers/messages');

router.put('/update-message', auth, handleMessageUpdate);
router.delete('/delete-message', auth, handleDeleteMessage);
router.get('/last-x-photo-messages', getLastXMessagesWithPhoto);
router.get('/average-metrics', getAverageMetrics);

module.exports = router;
