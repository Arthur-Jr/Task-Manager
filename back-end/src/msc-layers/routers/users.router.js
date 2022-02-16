const express = require('express');

const {
  registerUserController,
} = require('../controllers/users.controller');

const router = express.Router();

router.post('/', registerUserController);

module.exports = router;
