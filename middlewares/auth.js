const user = require('../models/user');
const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    next({ message: 'No token provided.', statusCode: 403 });
    return;
  }
  const token = authorization.replace('Bearer ', '').replace('"', '');
  let payload;
  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    next({ message: 'Token was declined.', statusCode: 403 });
  }
  req.user = payload;
  next();
};
