const supervisor = require('../models/supervisor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const user = require('../models/user');
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
          return;
        }
        const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
        res.send({ token });
      });
    })
    .catch(next);
};

const getGrowers = (req, res, next) => {
  const { _id } = req.user;
  if (!_id) next(new Error({ message: 'No token received', statusCode: 403 }));
  supervisor
    .findById(_id)
    .select('users')
    .populate('users', '-messageHistory')
    .orFail(() => next({ message: 'No growers found for selected user', statusCode: 404 }))
    .then((results) => {
      res.send(results);
    })
    .catch(next);
};

const addGrower = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { phoneNumber } = req.body;
    const userId = await user.findOne({ phoneNumber });
    if (!userId) throw new Error({ message: 'Grower not found', statusCode: 404 });
    supervisor
      .findByIdAndUpdate(_id, { $push: { users: userId._id } }, { upsert: true, new: true })
      .orFail(() => next({ message: 'Supervisor not found', statusCode: 404 }))
      .then((result) => {
        res.status(204).send({ message: 'Grower added' });
      });
  } catch (err) {
    next(err);
  }
};

const getAdminDetails = (req, res, next) => {
  const { _id: userId } = req.user;
  supervisor
    .findById(userId)
    .then((admin) => {
      if (!admin) res.status(401).send({ message: 'Unauthorized' });
      res.send({ email: admin.email, name: admin.username });
    })
    .catch(next);
};

module.exports = { handleSuperSignin, getGrowers, addGrower, getAdminDetails };
