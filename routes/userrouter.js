const { handleSignup } = require('../controllers/users');
const authMiddleware = require('../middlewares/auth');
const router = require('express').Router();

router.post('/user', authMiddleware, handleSignup);

module.exports = router;
