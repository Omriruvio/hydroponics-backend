/**
 * checks if the request is a mobile request if so sets req.isMobileRequest to true
 */

const isMobileRequest = (req, res, next) => {
  if (req.body.messageBody) {
    req.isMobileRequest = true;
  }
  next();
};

module.exports = isMobileRequest;
