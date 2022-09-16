const User = require('../models/user');
const System = require('../models/system');

const addUserToSystem = async (req, res, next) => {
  const { systemId, userId } = req.body;
  try {
    const system = await System.findById(systemId);
    const user = await User.findById(userId);
    // add user and system to each other's arrays only if they are not already present
    if (!system.users.includes(user._id)) {
      system.users.push(user._id);
    }
    if (!user.systems.includes(system._id)) {
      user.systems.push(system._id);
    }
    // if the user doesn't have a default system, set the system they just joined as their default system
    if (!user.defaultSystem) {
      user.defaultSystem = system._id;
    }
    await system.save();
    await user.save();
    res.status(200).send({ message: 'User added to system successfully.', system });
  } catch (err) {
    next(err);
  }
};

const removeUserFromSystem = async (req, res, next) => {
  const { systemId, phoneNumber } = req.body;
  try {
    const system = await System.findById(systemId);
    const user = await User.findOne({ phoneNumber });
    system.users.pull(user);
    user.systems.pull(system);
    await system.save();
    await user.save();
    res.status(200).send({ message: 'User removed from system successfully.' });
  } catch (err) {
    next(err);
  }
};

const getSystemUsers = async (req, res, next) => {
  const { systemId } = req.params;
  try {
    const system = await System.findById(systemId).populate('users');
    res.status(200).send({ users: system.users });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addUserToSystem,
  removeUserFromSystem,
  getSystemUsers,
};
