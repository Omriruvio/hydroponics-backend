const { SID, AUTH_TOKEN, HYDROPONICS_WA_NUMBER } = process.env;
const client = require('twilio')(SID, AUTH_TOKEN);

module.exports = (req, res, next) => {
  if (!req.body.From) throw new Error('Not a recognized message type (whatsapp only route).');
  const hasMediaUrl = req.body['MediaUrl0'] || false;
  const incomingNumber = req.body.From;
  console.log(req);
  if (hasMediaUrl) {
    client.messages
      .create({ from: HYDROPONICS_WA_NUMBER, to: incomingNumber, body: 'Media item received and is being Hydroponically assessed.' })
      .then((message) => {
        res.setHeader('Content-type', 'text/csv');
        res.status(200).send(JSON.stringify({ message: 'Message received.' }));
        console.log(message);
      })
      .catch(next);
  } else {
    console.log('incoming triggered');
    client.messages
      .create({ from: HYDROPONICS_WA_NUMBER, to: incomingNumber, body: 'Processing your Hydroponic state. Stay tuned.' })
      .then((message) => {
        res.status(200).send(JSON.stringify({ message: 'Message received.' }));
        console.log(message);
      })
      .catch(next);
  }
};
