const { ERROR_LOG_PATH } = require('../../config');
const fs = require('fs/promises');
const path = require('path');
const { dirname } = require('path');

const logError = (err) => {
  return fs
    .appendFile(path.join(dirname(require.main.filename), ERROR_LOG_PATH), JSON.stringify(err) + '\n')
    .then(() => console.log('error logged'))
    .catch((err) => console.log(err));
};

module.exports = logError;
