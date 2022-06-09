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
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  console.log(req);
  res.send('Hello World!');
});

app.post('/incoming', (req, res) => {
  console.log(req.body);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
