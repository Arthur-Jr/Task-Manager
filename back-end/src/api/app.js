const express = require('express');
const bodyParser = require('body-parser');

const errorMiddleware = require('../middlewares/errorMiddleware');
const userRouter = require('../msc-layers/routers/users.router');
const loginRouter = require('../msc-layers/routers/login.router');
const tasksRouter = require('../msc-layers/routers/tasks.router');

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

app.get('/', (_request, response) => {
  response.send();
});

app.use('/users', userRouter);

app.use('/login', loginRouter);

app.use('/tasks', tasksRouter);

app.use(errorMiddleware);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = app;
