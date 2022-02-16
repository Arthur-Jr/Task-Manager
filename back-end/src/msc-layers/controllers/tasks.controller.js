const rescue = require('express-rescue');

const { CREATED } = require('../../utils/http-status-code');
const { registerTaskService } = require('../services/tasks.service');

const registerTaskController = rescue(async (req, res) => {
  const {
    user: { id }, title, description, status,
  } = req.body;

  const task = await registerTaskService(id, { title, description, status });

  return res.status(CREATED).json(task);
});

module.exports = {
  registerTaskController,
};
