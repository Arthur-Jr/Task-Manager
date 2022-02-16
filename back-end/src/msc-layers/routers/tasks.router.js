const express = require('express');

const authMiddleware = require('../../middlewares/authMiddleware');
const {
  registerTaskController,
  getAllUserTasksController,
} = require('../controllers/tasks.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/', registerTaskController);

router.get('/', getAllUserTasksController);

module.exports = router;
