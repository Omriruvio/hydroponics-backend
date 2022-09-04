const twilio = require('twilio');

/**
 * Middleware to confirm a request came from twilio webhook.
 */
const verifyTwilioRequest = (req, res, next) => {
  if (process.env.NODE_ENV === 'test') {
    return next();
  }
  const twilioSignature = req.headers['x-twilio-signature'];
  const validation_url = `${req.protocol}://${req.hostname}${req.url}`;

  if (twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN, twilioSignature, validation_url, {})) {
    // console.log('twilio message validated successfully!');
    next();
  } else {
    // console.log('** Invalid twilio signature on incoming request!');
    res.status(403).send({
      error: 'Invalid signature.',
    });
  }
};

module.exports = { verifyTwilioRequest };
