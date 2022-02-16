const joi = require('joi');
const bcrypt = require('bcrypt');
const { BAD_REQUEST, UNAUTHORIZED } = require('../../utils/http-status-code');
const { getUserByEmailModel } = require('../models/users.model');
const { getToken } = require('../../jwt/jwt');

const incorretInfoThrow = () => {
  const err = new Error('Incorrect username or password');
  err.status = UNAUTHORIZED;
  err.message = 'Incorrect username or password';
  throw err;
};

const checkLoginInfo = (info) => {
  const { error } = joi.object({
    password: joi.string().length(6).required(),
    email: joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
  }).validate(info);

  if (error) {
    const err = new Error(error.message);
    err.status = BAD_REQUEST;
    err.message = error.message;
    throw err;
  }
};

const checkPassword = async (userPass, loginPass) => {
  const cryptCheck = await bcrypt.compare(loginPass, userPass);

  if (!cryptCheck) incorretInfoThrow();
};

const loginService = async ({ email, password }) => {
  checkLoginInfo({ email, password });
  const user = await getUserByEmailModel(email);

  if (!user) incorretInfoThrow();
  await checkPassword(user.password, password);

  const { _id: id } = user;
  const token = getToken({ id, email });

  return { token };
};

module.exports = {
  loginService,
};
