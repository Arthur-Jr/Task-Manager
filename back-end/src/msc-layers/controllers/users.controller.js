const rescue = require('express-rescue');

const { CREATED } = require('../../utils/http-status-code');
const { registerUserService } = require('../services/users.service');

const registerUserController = rescue(async (req, res) => {
  const { email, name, password } = req.body;

  const token = await registerUserService({ email, name, password });

  return res.status(CREATED).json(token);
});

module.exports = {
  registerUserController,
};
