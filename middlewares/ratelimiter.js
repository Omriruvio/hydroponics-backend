const limiter = require('express-rate-limit');

const rateLimiter = limiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 5 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

module.exports = { rateLimiter };
