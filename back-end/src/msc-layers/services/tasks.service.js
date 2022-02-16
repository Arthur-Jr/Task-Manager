const joi = require('joi');

const { BAD_REQUEST } = require('../../utils/http-status-code');
const { registerTaskModel } = require('../models/tasks.model');

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

module.exports = {
  registerTaskService,
};
