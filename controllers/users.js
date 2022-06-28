const bcrypt = require('bcryptjs');
const User = require('../models/user');

const handleSignup = (req, res, next) => {
  const { email, password, phone, messageOptIn } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      User.create({
        email,
        password: hash,
        phoneNumber: phone,
        messageOptIn,
      })
        .then((user) => {
          res.status(200).send({ email: user.email, id: user._id });
        })
        .catch(() => next(new Error('User already exists.')));
      // TODO: custom error & status codes
    })
    .catch(next);
};

const handleLogin = (req, res, next) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .select('password')
    .orFail((err) => next(err))
    .then((user) => {
      bcrypt
        .compare(password, user.password)
        .then((match) => {
          if (match) res.send({ id: user._id });
          else throw new Error('Access denied.');
          // TODO: custom error & status codes
        })
        .catch((err) => next(new Error('Access denied.')));
      // TODO: custom error & status codes
    })
    .catch(next);
};

module.exports = { handleSignup, handleLogin };
