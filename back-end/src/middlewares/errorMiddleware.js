const { INTERNAL } = require('../utils/http-status-code');

// eslint-disable-next-line no-unused-vars
module.exports = (err, _req, res, _next) => {
  console.log(err.message);

  if (err.status) {
    return res.status(err.status).json({ message: err.message });
  }

  return res.status(INTERNAL).json({ message: 'Internal Server Error' });
};
