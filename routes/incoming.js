const incoming = require('../controllers/incoming');

const router = require('express').Router();

router.post('/incoming', incoming);

module.exports = router;
