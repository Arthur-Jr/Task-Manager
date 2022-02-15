const express = require('express');
const bodyParser = require('body-parser');

const userRouter = require('../msc-layers/routers/users.router');

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());

app.get('/', (_request, response) => {
  response.send();
});

app.use('/users', userRouter);

app.listen(port, () => console.log(`Example app listening on port ${port}!`));