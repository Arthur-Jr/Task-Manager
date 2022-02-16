const connection = require('./connection');

const COLLECTION_NAME = 'tasks';

const registerTaskModel = async (task) => {
  const db = await connection();
  const { insertedId } = await db.collection(COLLECTION_NAME).insertOne(task);
  return insertedId;
};

module.exports = {
  registerTaskModel,
};
