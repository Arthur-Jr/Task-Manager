const rescue = require('express-rescue');

const { HTTP_OK_STATUS } = require('../../utils/http-status-code');
const { loginService } = require('../services/login.service');

const loginController = rescue(async (req, res) => {
  const { email, password } = req.body;

  const token = await loginService({ email, password });

  return res.status(HTTP_OK_STATUS).json(token);
});

module.exports = {
  loginController,
};
