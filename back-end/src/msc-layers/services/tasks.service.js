const joi = require('joi');

const { BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = require('../../utils/http-status-code');
const {
  registerTaskModel,
  getAllUserTasksModel,
  getTaskByIdModel,
  editTaskModel,
  deleteTaskModel,
} = require('../models/tasks.model');

const notFoundThrow = () => {
  const err = new Error('task not found');
  err.status = NOT_FOUND;
  err.message = 'task not found';
  throw err;
};

const invalidTokenThrow = () => {
  const err = new Error('invalid token');
  err.status = UNAUTHORIZED;
  err.message = 'invalid token';
  throw err;
};

const checkTaskInfo = (info) => {
  const { error } = joi.object({
    title: joi.string().min(3).required(),
    status: joi.string().required(),
  }).validate(info);

  if (error) {
    const err = new Error(error.message);
    err.status = BAD_REQUEST;
    err.message = error.message;
    throw err;
  }
};

const checkUserauthorization = async (taskId, userId) => {
  const task = await getTaskByIdModel(taskId);

  if (task === null) notFoundThrow();

  if (task.userId.toString() !== userId.toString()) invalidTokenThrow();
};

const registerTaskService = async (userId, { title, description = '', status }) => {
  checkTaskInfo({ title, status });
  const task = {
    userId,
    title,
    description,
    status,
    insertedDate: new Date(),
  };

  const id = await registerTaskModel(task);

  return { id, ...task };
};

const getAllUserTasksService = async (userId) => getAllUserTasksModel(userId);

const editTaskService = async (userId, { title, description = '', status }, taskId) => {
  checkTaskInfo({ title, status });
  await checkUserauthorization(taskId, userId);

  return editTaskModel(taskId, { title, description, status });
};

const deleteTaskService = async (taskId, userId) => {
  await checkUserauthorization(taskId, userId);

  await deleteTaskModel(taskId);
};

module.exports = {
  registerTaskService,
  getAllUserTasksService,
  editTaskService,
  deleteTaskService,
};
