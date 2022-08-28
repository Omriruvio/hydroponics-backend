const supervisor = require('../models/supervisor');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { findGrowerIds } = require('./find-grower-ids');

/**
 * adds a supervisor to the database
 * @param {{phoneNumber: number, email: string, username: string, password: string, growersNumbers: string[]}}
 */
async function addSupervisor({ phoneNumber, email, username, password, growersNumbers }) {
  const growerIds = await findGrowerIds(growersNumbers);
  const encryptedPassword = await bcrypt.hash(password, 10);

  const supervisorToAdd = {
    phoneNumber: `whatsapp:+972${+phoneNumber}`,
    email,
    username,
    password: encryptedPassword,
    users: growerIds,
  };

  const admin = new supervisor(supervisorToAdd);
  await admin.save();
}

module.exports = { addSupervisor };
