const { handleSignup, handleLogin } = require('../controllers/users');
const authMiddleware = require('../middlewares/auth');
const router = require('express').Router();

router.post('/register', authMiddleware, handleSignup);
router.post('/login', authMiddleware, handleLogin);

module.exports = router;
