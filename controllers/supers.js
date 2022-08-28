const supervisor = require('../models/supervisor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { NODE_ENV, JWT_SECRET } = process.env;

const handleSuperSignin = (req, res, next) => {
  const { email, password } = req.body;
  supervisor
    .findOne({ email })
    .select('+password')
    .orFail(() => next({ message: 'Invalid credentials', statusCode: 403 }))
    .then((user) => {
      bcrypt.compare(password, user.password).then((match) => {
        if (!match) {
          res.status(403).send({ message: 'Invlid credentials.' });
        }
        const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
        res.send({ token });
      });
    })
    .catch(next);
};

module.exports = { handleSuperSignin };
