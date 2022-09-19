const { MongoClient } = require('mongodb');
require('dotenv').config();
const app = require('../server.js');
const supertest = require('supertest');
const { DEFAULT_HELP_MESSAGE } = require('../config.js');
const { addSupervisor } = require('../utils/add-supervisor.js');
const User = require('../models/user');
const Message = require('../models/message');
const System = require('../models/system');
const request = supertest(app);

const mockUser = {
  username: 'mock-user',
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
  username: 'mobile-mock-user',
  whatsappName: 'mobile-mock-user',
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

const mockSupervisor = {
  phoneNumber: '0587999999',
  email: 'test-supervisor@gmail.com',
  username: 'test-supervisor-name',
  password: 'abcd1234',
  growersNumbers: '0587400020',
};

let connection;
let db;
let user;
let mainCollection;
let superCollection;
let mockSupervisorId;
let supervisorToken;
let systemsCollection;
let testSystemCollectionId;
let mockUserId;
let messageCollection;
let mockSystemId;
let mockSystem;

beforeAll(async () => {
  connection = await MongoClient.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  db = await connection.db('hydroponics');
  user = db.collection('test-collection');
  mainCollection = db.collection('users');
  superCollection = db.collection('supervisors');
  systemsCollection = db.collection('systems');
  messageCollection = db.collection('messages');
  await addSupervisor(mockSupervisor);
  await user.insertOne(mockUser);
  await systemsCollection.deleteMany({ ownerName: 'mock-user' });
});

afterAll(async () => {
  await db.dropCollection('test-collection');
  await mainCollection.findOneAndDelete({ phoneNumber: mockUser.phoneNumber });
  await mainCollection.findOneAndDelete({ phoneNumber: mobileMockUser.phoneNumber });
  await superCollection.findOneAndDelete({ phoneNumber: `whatsapp:+972${+mockSupervisor.phoneNumber}` });
  await systemsCollection.findOneAndDelete({ users: { $in: [testSystemCollectionId] } });
  await systemsCollection.deleteMany({ ownerName: mockUser.username, ownerPhoneNumber: mockUser.phoneNumber });
  await messageCollection.deleteMany({ senderName: mockUser.username, senderPhoneNumber: mockUser.phoneNumber });

  await connection.close();
});

describe('Testing mock database', () => {
  it('should insert a doc with a mock user', async () => {
    const insertedUser = await user.findOne({ phoneNumber: mockUser.phoneNumber });
    expect(insertedUser).toEqual({ ...mockUser, _id: insertedUser._id });
  });
});

describe('Testing supervisor collection', () => {
  it('should insert a doc with a mock supervisor', async () => {
    const insertedUser = await superCollection.findOne({ phoneNumber: `whatsapp:+972${+mockSupervisor.phoneNumber}` });
    expect(insertedUser).toEqual({ ...insertedUser, phoneNumber: `whatsapp:+972${+mockSupervisor.phoneNumber}` });
    mockSupervisorId = insertedUser._id;
  });
});

describe('Testing endpoints', () => {
  it('should receive response from the root route', async () => {
    const response = await request.get('/');
    expect(response.text).toBe('<h1>Hello from Hydroponics!</h1>');
  });

  it('Should successfully log in as supervisor', async () => {
    const response = await request.post('/super/login').send({ email: mockSupervisor.email, password: mockSupervisor.password });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
    supervisorToken = response.body.token;
  });

  it('Should successfully verify a supervisor with a token', async () => {
    const response = await request.get('/super/verify').set('authorization', `Bearer ${supervisorToken}`);
    expect(response.status).toBe(200);
  });

  it('Should subscribe a new user', async () => {
    const response = await request.post('/register').send(mockUser);
    expect(response.body.userId).toBeTruthy();
    mockUser._id = response.body.userId;
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
    expect(response.body.messageId).toBeTruthy();
    const lastMessage = await Message.findOne({ phoneNumber: mockUser.phoneNumber }).sort({ _id: -1 });
    expect(String(lastMessage.user)).toEqual(mockUser._id);
    expect(lastMessage).toBeTruthy();
  });

  it('Should successfully respond to request for help', async () => {
    const response = await request.post('/help').send(mockUser);
    expect(response.body.status).toBe('ok');
    expect(response.body.message).toBe(DEFAULT_HELP_MESSAGE);
  });

  it('Should respond for message history (web route - plain phone number w/o prefix)', async () => {
    const response = await request.get(`/history/0587411121/1/undefined`).send({ ...mockUser, phoneNumber: '0587411121' });
    expect(response.body.length).toBe(1);
  });

  it('Should add a grower to a supervisor', async () => {
    const response = await request
      .put('/super/add-grower')
      .send({ phoneNumber: mockUser.phoneNumber })
      .set('authorization', `Bearer ${supervisorToken}`);
    expect(response.status).toBe(204);
  });

  it("Should retrieve list of supervisors' growers", async () => {
    const response = await request.get(`/super/growers`).set('authorization', `Bearer ${supervisorToken}`);
    expect(response.body.users.some((user) => user.email === mockUser.email)).toBeTruthy();
    expect(response.status).toBe(200);
  });

  it('Should successfully delete last crop data message', async () => {
    const response = await request.post('/delete-last').send(mockUser);
    expect(response.body.status).toBe('ok');

    const insertedUser = await User.findOne({ phoneNumber: mockUser.phoneNumber }).populate('messageHistory');
    console.log('message history after delete', insertedUser.messageHistory);
    expect(insertedUser.messageHistory.at(-1)).toBeFalsy();
  });

  it('Should create a new system for mock user', async () => {
    // request body should contain the system name, and the user's phone number, it returns the new system's id
    const response = await request.post('/new-system').send({ phoneNumber: mockUser.phoneNumber, systemName: 'test system' });
    expect(response.body.systemId).toBeTruthy();
    const insertedUser = await mainCollection.findOne({ phoneNumber: mockUser.phoneNumber });
    expect(insertedUser.systems.length).toBe(2);
    testSystemCollectionId = response.body.systemId;
  });

  it('Should add a user to a system', async () => {
    // returns the system's object
    const response = await request.post('/add-user-to-system').send({ userId: mockUser._id, systemId: testSystemCollectionId });
    expect(response.status).toBe(200);
    // check that response body includes the system property and log it
    const receivedSystem = response.body.system;
    expect(receivedSystem).toBeTruthy();
    // check that received system has a users property array with the mock user's id
    expect(receivedSystem.users.some((user) => user === mockUser._id)).toBeTruthy();
  });

  it('Should get all existing users of a system', async () => {
    const response = await request.get(`/get-system-users/${testSystemCollectionId}`);
    expect(response.body.users).toBeTruthy();
    expect(response.body.users.some((user) => user.email === mockUser.email)).toBeTruthy();
  });

  it('Should remove a user from a system', async () => {
    const response = await request.delete('/remove-user-from-system').send({ phoneNumber: mockUser.phoneNumber, systemId: testSystemCollectionId });
    expect(response.status).toBe(200);
    // find all systems in the db, get the last system from the array and check that in this system the mockuser is not in the users array or that the array is empty
    const allSystems = await db.collection('systems').find({}).toArray();
    const lastSystem = allSystems[allSystems.length - 1];
    expect(lastSystem.users.some((user) => user === mockUser._id)).toBeFalsy();
  });

  // test cropdata route requesting 'create system <system-name>'
  it('Should create a new system for mock user (mobile message)', async () => {
    const response = await request.post('/cropdata').send({ phoneNumber: mockUser.phoneNumber, messageBody: 'create system test-system' });
    expect(response.body.systemId).toBeTruthy();
    mockSystemId = response.body.systemId;
    mockSystem = await System.findById(mockSystemId);
    expect(mockSystem).toBeTruthy();
  });

  // test cropdata route requesting 'system <system-name> <crop-data>'
  it('Should add crop data to a system', async () => {
    const response = await request.post('/cropdata').send({ phoneNumber: mockUser.phoneNumber, messageBody: 'system test-system t50p6.6' });
    expect(response.body.status).toBe('ok');
    // check that mockSystem has in its last message in the messageHistory array the messageBody 't50p6.6'
    mockSystem = await System.findById(mockSystemId).populate('messageHistory');
    expect(mockSystem.messageHistory.at(-1).messageBody).toBe('t50p6.6');
  });

  // test cropdata route requesting 'default system <system-name>'
  it('Should set a system as default for a user', async () => {
    // create a new system system2 for the mock user then test setting it as default
    const response = await request.post('/cropdata').send({ phoneNumber: mockUser.phoneNumber, messageBody: 'create system test-system2' });
    expect(response.body.systemId).toBeTruthy();
    const mockSystem2Id = response.body.systemId;
    const response2 = await request.post('/cropdata').send({ phoneNumber: mockUser.phoneNumber, messageBody: 'default system test-system2' });
    expect(response2.status).toBe(200);
    // check that the mock user's default system is the system2
    const user = await User.findOne({ phoneNumber: mockUser.phoneNumber });
    expect(user.defaultSystem.toString()).toBe(mockSystem2Id);
  });

  // test cropdata route requesting 'my systems'
  it('Should get all existing systems of a user', async () => {
    const response = await request.post('/cropdata').send({ phoneNumber: mockUser.phoneNumber, messageBody: 'my systems' });
    expect(response.body.systemNames).toBe('default, test-system, test-system2');
  });
});
