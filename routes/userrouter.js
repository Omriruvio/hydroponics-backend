const { handleSignup, handleLogin, handleMobileSignup, handleCropData } = require('../controllers/users');
const authMiddleware = require('../middlewares/auth');
const user = require('../models/user');
const router = require('express').Router();

router.post('/register', handleSignup);
router.post('/login', handleLogin);
// incoming request from twilio flow authentication process
router.post('/identify', authMiddleware, (req, res) => {
  // receives body.userNumber
  // should respond with success for processing incoming crop data
  // if no match - should response with a 400 unauthorized to trigger
  // prompt for signup process
  console.log(req);
  const { phoneNumber } = req.body;
  user.findOne({ phoneNumber }).then((foundUser) => {
    if (!foundUser) {
      console.log('user not found');
      res.status(406).send({ message: 'User not found.' });
      return;
    } else {
      console.log('user found');
      res.status(200).send({ user: foundUser });
    }
  });
});

router.post('/cropdata', handleCropData);

router.post('/mobilesignup', handleMobileSignup);

module.exports = router;
