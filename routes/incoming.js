const incoming = require('../controllers/incoming');

const router = require('express').Router();

const authMiddleware = (req, res, next) => {
  next();
};

router.post('/incoming', authMiddleware, incoming);

module.exports = router;
