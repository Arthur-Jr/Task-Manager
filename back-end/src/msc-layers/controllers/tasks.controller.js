const rescue = require('express-rescue');

const { CREATED, HTTP_OK_STATUS } = require('../../utils/http-status-code');
const {
  registerTaskService,
  getAllUserTasksService,
} = require('../services/tasks.service');

const registerTaskController = rescue(async (req, res) => {
  const {
    user: { id }, title, description, status,
  } = req.body;

  const task = await registerTaskService(id, { title, description, status });

  return res.status(CREATED).json(task);
});

const getAllUserTasksController = async (req, res) => {
  const { id } = req.body.user;

  const tasks = await getAllUserTasksService(id);

  return res.status(HTTP_OK_STATUS).json(tasks);
};

module.exports = {
  registerTaskController,
  getAllUserTasksController,
};
