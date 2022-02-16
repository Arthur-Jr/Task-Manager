const express = require('express');

const authMiddleware = require('../../middlewares/authMiddleware');
const {
  registerTaskController,
  getAllUserTasksController,
  editTaskController,
} = require('../controllers/tasks.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/', registerTaskController);

router.get('/', getAllUserTasksController);

router.put('/:id', editTaskController);

module.exports = router;
