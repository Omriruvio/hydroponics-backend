require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const { errorLogger, requestLogger } = require('./middlewares/logger');
const app = express();
const port = process.env.PORT || 3000;
const { SID, AUTH_TOKEN, MONGODB_URI } = process.env;
const accountSid = SID;
const authToken = AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const incomingRoute = require('./routes/incoming');
const userRoute = require('./routes/userrouter');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(MONGODB_URI);

app.use(requestLogger);

app.get('/', (req, res) => {
  res.send('<h1>Hello from Hydroponics!</h1>');
});

app.use('/', incomingRoute, userRoute);

app.use(errorLogger);

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).send({ message: err.message || 'Internal server error.' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Hydroponics app listening at ${port}`);
  });
}

// const accountSid = 'ACaf9782d3cc4e05574c13a93dc7b3d022';
// const authToken = '[AuthToken]';
// const client = require('twilio')(accountSid, authToken);

// client.messages
//       .create({
//          body: 'Your CyberGames code is 1238432',
//          from: 'whatsapp:+14155238886',
//          to: 'whatsapp:+972587400020'
//        })
//       .then(message => console.log(message.sid))
//       .done();

// const accountSid = 'ACaf9782d3cc4e05574c13a93dc7b3d022';
// const authToken = '[AuthToken]';
// const client = require('twilio')(accountSid, authToken);

// client.messages
//       .create({
//          body: 'Hello, this is CyberGames, how can we help you?',
//          from: 'whatsapp:+14155238886',
//          to: 'whatsapp:+972587400020'
//        })
//       .then(message => console.log(message.sid))
//       .done();
