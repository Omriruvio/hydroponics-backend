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
          res.status(200).send(user);
        })
        .catch(next);
    })
    .catch(next);
};

module.exports = { handleSignup };
