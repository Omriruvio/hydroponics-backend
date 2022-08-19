const { MongoClient } = require('mongodb');
require('dotenv').config();
const app = require('../server.js');
const supertest = require('supertest');
const { DEFAULT_HELP_MESSAGE } = require('../config.js');
const request = supertest(app);

const mockUser = {
  phoneNumber: 'whatsapp:+972587411121',
  email: 'test-user@gmail.com',
  messageOptIn: false,
  messageHistory: [
    {
      dateReceived: new Date(),
      messageBody: 'temp 30 humidity 60 ph 6.5 ec 2.5',
      temperature: '30',
      humidity: '60',
      ph: '6.5',
      ec: '2.5',
      handled: false,
    },
  ],
  receiveReminders: true,
  lastReceivedPush: '2022-08-18T14:11:13.084Z',
};
const mobileMockUser = {
  phoneNumber: 'whatsapp:+972587411122',
  email: 'test-user-mobile@gmail.com',
  messageOptIn: false,
  messageHistory: [
    {
      dateReceived: new Date(),
      messageBody: 'temp 30 humidity 60 ph 6.5 ec 2.5',
      temperature: '30',
      humidity: '60',
      ph: '6.5',
      ec: '2.5',
      handled: false,
    },
  ],
  receiveReminders: true,
  lastReceivedPush: '2022-08-18T14:11:13.084Z',
};

let connection;
let db;
let user;
let mainCollection;

beforeAll(async () => {
  connection = await MongoClient.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  db = await connection.db('hydroponics');
  user = db.collection('test-collection');
  mainCollection = db.collection('users');
  // await mainCollection.deleteOne(mockUser);
  // await mainCollection.deleteOne(mobileMockUser);
  await user.insertOne(mockUser);
});

afterAll(async () => {
  await db.dropCollection('test-collection');
  await mainCollection.findOneAndDelete({ phoneNumber: mockUser.phoneNumber });
  await mainCollection.findOneAndDelete({ phoneNumber: mobileMockUser.phoneNumber });
  await connection.close();
});

describe('Testing database', () => {
  it('should insert a doc with a mock user', async () => {
    const insertedUser = await user.findOne({ phoneNumber: mockUser.phoneNumber });
    expect(insertedUser).toEqual({ ...mockUser, _id: insertedUser._id });
  });
});

describe('Testing endpoints', () => {
  it('should receive response from the root route', async () => {
    const response = await request.get('/');
    expect(response.text).toBe('<h1>Hello from Hydroponics!</h1>');
  });

  it('Should subscribe a new user', async () => {
    const response = await request.post('/register').send(mockUser);
    expect(response.status).toBe(201);
  });

  it('Should subscribe a new user from mobile (twilio route)', async () => {
    const response = await request.post('/mobilesignup').send(mobileMockUser);
    expect(response.body.email).toBe(mobileMockUser.email);
    expect(response.status).toBe(200);
  });

  it('Should retreive subscribed user from the database', async () => {
    const insertedUser = await mainCollection.findOne({ phoneNumber: mockUser.phoneNumber });
    expect(insertedUser).toEqual({ ...insertedUser, phoneNumber: insertedUser.phoneNumber });
  });

  it('Should successfully log a user in (web route - plain phone number w/o prefix)', async () => {
    const response = await request.post('/login').send({ ...mockUser, phoneNumber: '0587411121' });
    expect(response.status).toBe(200);
  });

  it('Should decline unknown login', async () => {
    const response = await request.post('/login').send({});
    expect(response.status).toBe(400);
  });

  it('Should successfully identify a user (twilio route)', async () => {
    const response = await request.post('/identify').send(mockUser);
    expect(response.status).toBe(202);
  });

  it('Should reject an undidentified user (twilio route)', async () => {
    const response = await request.post('/identify').send({});
    expect(response.status).toBe(204);
  });

  const defaultMessage = 't50p6.6';
  const mockCropDataMessage = { phoneNumber: mockUser.phoneNumber, messageBody: defaultMessage };

  it('Should successfully post a crop data message', async () => {
    const response = await request.post('/cropdata').send(mockCropDataMessage);
    expect(response.body.status).toBe('ok');
    const insertedUser = await mainCollection.findOne({ phoneNumber: mockUser.phoneNumber });
    expect(insertedUser.messageHistory.at(-1).messageBody).toBe(defaultMessage);
  });

  it('Should successfully respond to request for help', async () => {
    const response = await request.post('/help').send(mockUser);
    expect(response.body.status).toBe('ok');
    expect(response.body.message).toBe(DEFAULT_HELP_MESSAGE);
  });

  it('Should respond for message history (web route - plain phone number w/o prefix)', async () => {
    const response = await request.post('/history/1').send({ ...mockUser, phoneNumber: '0587411121' });
    expect(response.body.length).toBe(1);
  });

  it('Should successfully delete last crop data message', async () => {
    const response = await request.post('/delete-last').send(mockUser);
    expect(response.body.status).toBe('ok');
    const insertedUser = await mainCollection.findOne({ phoneNumber: mockUser.phoneNumber });
    expect(insertedUser.messageHistory.at(-1)).toBeFalsy();
  });
});
