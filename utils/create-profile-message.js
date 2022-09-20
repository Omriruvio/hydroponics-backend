/**
 * Utility function to create a message for the user to view their profile
 * @param {object} user - The user object
 * @returns {string} The message to send to the user
 */

const createProfileMessage = (user) => {
  let message = `Hello ${user.username}!\n\n`;
  if (!user.defaultSystem) {
    message += `You have not set a default system. \n`;
  } else {
    message += `Your default system name is "${user.defaultSystem.name}". \n`;
  }
  // you have X private systems which are named: system1, system2, system3 (or 'you have no private systems') private systems are found by checking isPublic property
  const privateSystems = user.systems.filter((system) => !system.isPublic);
  if (privateSystems.length === 0) message += 'You have no private systems. \n';
  else {
    message += `You have ${privateSystems.length} private systems which are named: `;
    privateSystems.forEach((system) => (message += `${system.name}, `));
    message = message.slice(0, -2);
    message += '. \n';
  }
  // you have X public systems which are named: system1, system2, system3 (or 'you have no public systems') public systems are found by checking isPublic property
  const publicSystems = user.systems.filter((system) => system.isPublic);
  if (publicSystems.length === 0) message += 'You have no public systems. \n';
  else {
    message += `You have ${publicSystems.length} public systems which are named: `;
    publicSystems.forEach((system) => (message += `${system.name}, `));
    message = message.slice(0, -2);
    message += '. \n';
  }

  message += `\nYou have sent a total of ${user.messageHistory.length} crop data submissions. \n`;
  // X of your sent messages were sent in the past month (or 'none of your sent messages were sent in the past month') - calculate by checking user.messageHistory's each message receivedAt property
  const messagesInPastMonth = user.messageHistory.filter((message) => message.dateReceived > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  if (messagesInPastMonth.length === 0) message += 'None of your data submissions were sent in the past month. \n';
  else message += `${messagesInPastMonth.length} of your sent data submissions were sent in the past month. \n`;

  // X of your crop data submissions were images (or 'none of your crop data submissions were images') - calculate by checking user.messageHistory's each message imageUrl property
  const messagesWithImages = user.messageHistory.filter((message) => message.imageUrl);
  if (messagesWithImages.length === 0) message += 'None of your data submissions were images. \n';
  else message += `${messagesWithImages.length} of your data submissions were images. \n`;

  return message;
};

module.exports = createProfileMessage;
