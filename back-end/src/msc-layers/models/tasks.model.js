const { ObjectId } = require('mongodb');

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

const getTaskByIdModel = async (taskId) => {
  const db = await connection();
  const task = await db.collection(COLLECTION_NAME).findOne({ _id: ObjectId(taskId) });
  return task;
};

const editTaskModel = async (taskId, data) => {
  const db = await connection();
  const task = await db.collection(COLLECTION_NAME).findOneAndUpdate(
    { _id: ObjectId(taskId) },
    { $set: { ...data } },
    { returnDocument: 'after' },
  );
  return task.value;
};

const deleteTaskModel = async (taskId) => {
  const db = await connection();
  await db.collection(COLLECTION_NAME).deleteOne({ _id: ObjectId(taskId) });
};

module.exports = {
  registerTaskModel,
  getAllUserTasksModel,
  getTaskByIdModel,
  editTaskModel,
  deleteTaskModel,
};
