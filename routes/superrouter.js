const { handleSuperSignin } = require('../controllers/supers');
const authMiddleware = require('../middlewares/auth');
const router = require('express').Router();

router.post('/super/login', handleSuperSignin);

module.exports = router;
