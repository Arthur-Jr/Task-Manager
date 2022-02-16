const connection = require('./connection');

const COLLECTION_NAME = 'tasks';

const registerTaskModel = async (task) => {
  const db = await connection();
  const { insertedId } = await db.collection(COLLECTION_NAME).insertOne(task);
  return insertedId;
};

const getAllUserTasksModel = async (userId) => {
  const db = await connection();
  const tasks = await db.collection(COLLECTION_NAME).find({ userId }).toArray();
  return tasks;
};

module.exports = {
  registerTaskModel,
  getAllUserTasksModel,
};
