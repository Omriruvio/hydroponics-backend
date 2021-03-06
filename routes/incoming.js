const incoming = require('../controllers/incoming');
const authMiddleware = require('../middlewares/auth');
const router = require('express').Router();

router.post('/incoming', authMiddleware, incoming);

module.exports = router;
