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

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const { SID, AUTH_TOKEN } = require('./keys').TWILIO;
const accountSid = process.env.TWILIO_ACCOUNT_SID || SID;
const authToken = process.env.TWILIO_AUTH_TOKEN || AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  console.log(req);
  res.send('Hello World!');
});

app.post('/incoming', (req, res) => {
  const hasMediaUrl = req.body['MediaUrl0'] || false;
  const incomingNumber = req.body.From;
  if (hasMediaUrl) {
    client.messages
      .create({ from: 'whatsapp:+14155238886', to: incomingNumber, body: 'Media item received and is being Hydroponically assessed.' })
      .then((message) => console.log(message))
      .catch((err) => console.log(err));
  } else {
    client.messages
      .create({ from: 'whatsapp:+14155238886', to: incomingNumber, body: 'Processing your Hydroponic state. Stay tuned.' })
      .then((message) => console.log(message))
      .catch((err) => console.log(err));
  }
});

app.listen(port, () => {
  console.log(`Hydroponics app listening at ${port}`);
});
