const joi = require('joi');
const bcrypt = require('bcrypt');
const { getToken } = require('../../jwt/jwt');

const { BAD_REQUEST, CONFLICT } = require('../../utils/http-status-code');
const { getUserByEmailModel, registerUserModel } = require('../models/users.model');

const checkUserInfos = (userInfos) => {
  const { error } = joi.object({
    email: joi.string()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: joi.string().length(6).required(),
    name: joi.string().min(3).required(),
  }).validate(userInfos);

  if (error) {
    const err = new Error(error.message);
    err.status = BAD_REQUEST;
    err.message = error.message;
    throw err;
  }
};

const cryptPassword = async (password) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

const isRegistred = async (email) => {
  const user = await getUserByEmailModel(email);

  if (user) {
    const err = new Error('Email already registered');
    err.status = CONFLICT;
    err.message = 'Email already registered';
    throw err;
  }
};

const registerUserService = async ({ email, name, password }) => {
  checkUserInfos({ email, name, password });
  await isRegistred(email);
  const cryptedPassword = await cryptPassword(password);

  const userId = registerUserModel({ email, name, password: cryptedPassword });
  const token = getToken({ userId, email });

  return { token };
};

module.exports = {
  registerUserService,
};
