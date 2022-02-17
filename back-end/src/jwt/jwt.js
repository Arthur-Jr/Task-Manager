const jwt = require('jsonwebtoken');
require('dotenv').config();

const { UNAUTHORIZED } = require('../utils/http-status-code');

const secret = process.env.JWT_SECRECT || 'tantoFaz';

const jwtConfig = {
  expiresIn: '8h',
  algorithm: 'HS256',
};

const getToken = (data) => jwt.sign({ data }, secret, jwtConfig);

const decodeToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    const err = new Error('Expired or invalid token');
    err.status = UNAUTHORIZED;
    err.message = 'Expired or invalid token';
    throw err;
  }
};

module.exports = {
  getToken,
  decodeToken,
};
