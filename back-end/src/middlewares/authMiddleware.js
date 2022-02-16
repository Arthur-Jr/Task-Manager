const rescue = require('express-rescue');
const { decodeToken } = require('../jwt/jwt');

const { getUserByEmailModel } = require('../msc-layers/models/users.model');
const { UNAUTHORIZED } = require('../utils/http-status-code');

const jwtErroThrow = () => {
  const err = new Error('Expired or invalid token');
  err.status = UNAUTHORIZED;
  err.message = 'Expired or invalid token';
  throw err;
};

const handleToken = async (token) => {
  const { data } = decodeToken(token);
  const user = await getUserByEmailModel(data.email);

  if (!user) jwtErroThrow();

  const { _id: id, email } = user;
  if (data.id !== id.toString()) jwtErroThrow();

  return { id, email };
};

module.exports = rescue(async (req, _res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    const err = new Error('Token not found');
    err.status = UNAUTHORIZED;
    err.message = 'Token not found';
    throw err;
  }

  const userInfo = await handleToken(authorization);

  req.body.user = userInfo;

  next();
});
