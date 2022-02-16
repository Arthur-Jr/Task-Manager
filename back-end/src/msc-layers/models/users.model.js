const connection = require('./connection');

const COLLECTION_NAME = 'users';

const getUserByEmailModel = async (email) => {
  const db = await connection();
  const user = await db.collection(COLLECTION_NAME).findOne({ email });

  return user;
};

const registerUserModel = async (user) => {
  const db = await connection();
  const { insertedId } = await db.collection(COLLECTION_NAME).insertOne(user);
  return insertedId;
};

module.exports = {
  getUserByEmailModel,
  registerUserModel,
};
