require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errorLogger, requestLogger } = require('./middlewares/logger');
const app = express();
const port = process.env.PORT || 3000;
const { MONGODB_URI, NODE_ENV } = process.env;
const incomingRoute = require('./routes/incoming');
const userRoute = require('./routes/userrouter');
const superRoute = require('./routes/superrouter');
const systemRoute = require('./routes/systemrouter');
const messageRoute = require('./routes/messagerouter');
const cors = require('cors');
const { rateLimiter } = require('./middlewares/ratelimiter.js');
const { scheduler, pollForPushNotification } = require('./utils/tasks/poll-inactive-users');
const logError = require('./utils/errors/log-error');

NODE_ENV !== 'DEV' && app.use(rateLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.set('trust proxy', true);

mongoose.connect(MONGODB_URI);

app.use(requestLogger);

app.get('/', (req, res) => {
  res.send('<h1>Hello from Hydroponics!</h1>');
});

app.use('/', incomingRoute, userRoute, superRoute, systemRoute, messageRoute);

app.use('*', (req, res) => {
  res.status(404).send({ message: 'Resource not found' });
});

app.use(errorLogger);

app.use((err, req, res, next) => {
  console.log(err);
  if (!err.statusCode) {
    logError(err);
  }
  res.status(err.statusCode || 500).send({ message: err.message || 'Internal server error.' });
});

if (NODE_ENV !== 'test') {
  // schedules push notification to inactive users
  scheduler.addSimpleIntervalJob(pollForPushNotification);
  app.listen(port, () => {
    console.log(`Hydroponics app listening at ${port}`);
  });
}

module.exports = app;
