const express = require('express');

const authMiddleware = require('../../middlewares/authMiddleware');
const { registerTaskController } = require('../controllers/tasks.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/', registerTaskController);

module.exports = router;
