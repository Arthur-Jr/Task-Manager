const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { MongoClient } = require('mongodb');

const { getConnection } = require('./mongoMockConnection');
const server = require('../api/app');
const { CREATED, BAD_REQUEST, CONFLICT, UNAUTHORIZED, HTTP_OK_STATUS, NO_CONTENT } = require('../utils/http-status-code');

const { expect } = chai;

chai.use(chaiHttp);

const DB_NAME = 'task-manager';
const DB_COLLECTION = 'tasks';
const USER_EXAMPLE = { email: 'test@email.com', name: 'test', password: '123456'};
const TASK_EXAMPLE = { title: 'test task', description: 'testing', status: 'pendente' };

describe('Testes da rota "tasks".', () => {
  let connectionMock;
  let loginResponse;
  let registerResponse;
  let taskId;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
    sinon.stub(console, 'log');

    registerResponse = await chai.request(server).post('/users')
    .send({
      email: USER_EXAMPLE.email,
      name: USER_EXAMPLE.name,
      password: USER_EXAMPLE.password,
    });

    loginResponse = await chai.request(server)
    .post('/login').send({ email: USER_EXAMPLE.email, password: USER_EXAMPLE.password, });
  });

  after(async () => {
    await connectionMock.db(DB_NAME).collection(DB_COLLECTION).deleteMany({});
    await connectionMock.db(DB_NAME).collection(DB_COLLECTION).drop();

    await connectionMock.db(DB_NAME).collection('users').deleteMany({});
    await connectionMock.db(DB_NAME).collection('users').drop();

    MongoClient.connect.restore();
    console.log.restore();
  });

  describe('Testes de registro de "tasks"', () => {
    let response;

    const registerTask = async (description, title, status, token) => {
      response = await chai.request(server)
      .post('/tasks')
      .set('authorization', token)
      .send({ description, title, status });
    };

    describe('Quando a "task" é registrada com sucesso.', () => {
      before(async () => {
        await registerTask(TASK_EXAMPLE.description, TASK_EXAMPLE.title, TASK_EXAMPLE.status, loginResponse.body.token);

        taskId = response.body.id;
      });

      it('Deve retornar o código de status 201', () => {
        expect(response).to.have.status(CREATED);
      });

      it('Deve retornar um objeto', () => {
        expect(response.body).to.be.a('object');
      });

      it('Deve possuir a propriedade "id"', () => {
        expect(response.body).to.have.property('id');
      });

      it('Deve possuir a propriedade "userId"', () => {
        expect(response.body).to.have.property('userId');
      });

      it('Deve possuir a propriedade "insertedDate"', () => {
        expect(response.body).to.have.property('insertedDate');
      });
    });

    describe('Quando o campo "title" não for valido.', () => {
      before(async () => {
        await registerTask(TASK_EXAMPLE.description, undefined, TASK_EXAMPLE.status, loginResponse.body.token);
      });

      it('Deve retornar o código de status 400', () => {
        expect(response).to.have.status(BAD_REQUEST);
      });

      it('Deve retornar um objeto', () => {
        expect(response.body).to.be.a('object');
      });

      it('Deve possuir a propriedade "message"', () => {
        expect(response.body).to.have.property('message');
      });

      it('A propriedade "message" deve ser igual a ""title" is required"', () => {
        expect(response.body.message).to.be.equal('"title" is required');
      });
    });

    describe('Quando o campo "status" não for valido.', () => {
      before(async () => {
        await registerTask(TASK_EXAMPLE.description, TASK_EXAMPLE.title, undefined, loginResponse.body.token);
      });

      it('Deve retornar o código de status 400', () => {
        expect(response).to.have.status(BAD_REQUEST);
      });

      it('Deve retornar um objeto', () => {
        expect(response.body).to.be.a('object');
      });

      it('Deve possuir a propriedade "message"', () => {
        expect(response.body).to.have.property('message');
      });

      it('A propriedade "message" deve ser igual a ""status" is required"', () => {
        expect(response.body.message).to.be.equal('"status" is required');
      });
    });

    describe('Quando o "authorization" for vazio.', () => {
      before(async () => {
        response = await chai.request(server)
        .post('/tasks')
        .send({ description: TASK_EXAMPLE.description, title: TASK_EXAMPLE.title, status: TASK_EXAMPLE.status });
      });

      it('Deve retornar o código de status 401', () => {
        expect(response).to.have.status(UNAUTHORIZED);
      });

      it('Deve retornar um objeto', () => {
        expect(response.body).to.be.a('object');
      });

      it('Deve possuir a propriedade "message"', () => {
        expect(response.body).to.have.property('message');
      });

      it('A propriedade "message" deve ser igual a "Token not found"', () => {
        expect(response.body.message).to.be.equal('Token not found');
      });
    });

    describe('Quando o "authorization" for inválido.', () => {
      before(async () => {
        await registerTask(TASK_EXAMPLE.description, TASK_EXAMPLE.title, TASK_EXAMPLE.status, '999');
      });

      it('Deve retornar o código de status 401', () => {
        expect(response).to.have.status(UNAUTHORIZED);
      });

      it('Deve retornar um objeto', () => {
        expect(response.body).to.be.a('object');
      });

      it('Deve possuir a propriedade "message"', () => {
        expect(response.body).to.have.property('message');
      });

      it('A propriedade "message" deve ser igual a "Expired or invalid token"', () => {
        expect(response.body.message).to.be.equal('Expired or invalid token');
      });
    });
  });

  describe('Testes da listagem de "Tasks"', () => {
    let response;

    const getTasksRequest = async (token) => {
      response = await chai.request(server)
      .get('/tasks')
      .set('authorization', token);
    };

    describe('Quando as "tasks" são listadas com sucesso.', () => {
      before(async () => {
        await getTasksRequest(loginResponse.body.token);
      });

      it('Deve retornar o código de status 200', () => {
        expect(response).to.have.status(HTTP_OK_STATUS);
      });

      it('Deve retornar um array', () => {
        expect(response.body).to.be.a('array');
      });

      it('Deve retornar um objeto', () => {
        expect(response.body[0]).to.be.a('object');
      });

      it('Deve possuir a propriedade "_id"', () => {
        expect(response.body[0]).to.have.property('_id');
      });

      it('Deve possuir a propriedade "userId"', () => {
        expect(response.body[0]).to.have.property('userId');
        expect(response.body[0].userId).to.be.equal(registerResponse.body.user.id);
      });

      it('Deve possuir a propriedade "insertedDate"', () => {
        expect(response.body[0]).to.have.property('insertedDate');
      });
    });

    describe('Quando o "authorization" for vazio.', () => {
      before(async () => {
        response = await chai.request(server)
        .get('/tasks');
      });

      it('Deve retornar o código de status 401', () => {
        expect(response).to.have.status(UNAUTHORIZED);
      });

      it('Deve retornar um objeto', () => {
        expect(response.body).to.be.a('object');
      });

      it('Deve possuir a propriedade "message"', () => {
        expect(response.body).to.have.property('message');
      });

      it('A propriedade "message" deve ser igual a "Token not found"', () => {
        expect(response.body.message).to.be.equal('Token not found');
      });
    });

    describe('Quando o "authorization" for inválido.', () => {
      before(async () => {
        await getTasksRequest('999');
      });

      it('Deve retornar o código de status 401', () => {
        expect(response).to.have.status(UNAUTHORIZED);
      });

      it('Deve retornar um objeto', () => {
        expect(response.body).to.be.a('object');
      });

      it('Deve possuir a propriedade "message"', () => {
        expect(response.body).to.have.property('message');
      });

      it('A propriedade "message" deve ser igual a "Expired or invalid token"', () => {
        expect(response.body.message).to.be.equal('Expired or invalid token');
      });
    });
  });

  describe('Teste de edição de "tasks".', () => {
    let response;

    const editTasksRequest = async ({ title, description, status }, token) => {
      response = await chai.request(server)
      .put(`/tasks/${taskId}`)
      .set('authorization', token)
      .send({ title, description, status });
    };

    describe('Quando a "task" é editada com sucesso.', () => {
      before(async () => {
        await editTasksRequest(
          { title: 'Fazer testes', description: undefined, status: 'em andamento' },
          loginResponse.body.token
        );
      });

      it('Deve retornar o código de status 200', () => {
        expect(response).to.have.status(HTTP_OK_STATUS);
      });

      it('Deve retornar um objeto', () => {
        expect(response.body).to.be.a('object');
      });

      it('Deve possuir a propriedade "_id"', () => {
        expect(response.body).to.have.property('_id');
      });

      it('Deve possuir a propriedade "userId"', () => {
        expect(response.body).to.have.property('userId');
        expect(response.body.userId).to.be.equal(registerResponse.body.user.id);
      });

      it('Deve possuir a propriedade "insertedDate"', () => {
        expect(response.body).to.have.property('insertedDate');
      });

      it('Deve possuir o novo "title" e o novo "status', () => {
        expect(response.body.title).to.be.equal('Fazer testes');
        expect(response.body.status).to.be.equal('em andamento');
      });
    });

    describe('Quando o campo "title" não for valido.', () => {
      before(async () => {
        await editTasksRequest(
          { title: undefined, description: undefined, status: 'em andamento' },
          loginResponse.body.token
        );
      });

      it('Deve retornar o código de status 400', () => {
        expect(response).to.have.status(BAD_REQUEST);
      });

      it('Deve retornar um objeto', () => {
        expect(response.body).to.be.a('object');
      });

      it('Deve possuir a propriedade "message"', () => {
        expect(response.body).to.have.property('message');
      });

      it('A propriedade "message" deve ser igual a ""title" is required"', () => {
        expect(response.body.message).to.be.equal('"title" is required');
      });
    });

    describe('Quando o campo "status" não for valido.', () => {
      before(async () => {
        await editTasksRequest(
          { title: 'Fazer testes', description: undefined, status: undefined },
          loginResponse.body.token
        );
      });

      it('Deve retornar o código de status 400', () => {
        expect(response).to.have.status(BAD_REQUEST);
      });

      it('Deve retornar um objeto', () => {
        expect(response.body).to.be.a('object');
      });

      it('Deve possuir a propriedade "message"', () => {
        expect(response.body).to.have.property('message');
      });

      it('A propriedade "message" deve ser igual a ""status" is required"', () => {
        expect(response.body.message).to.be.equal('"status" is required');
      });
    });

    describe('Quando o "authorization" não for o do usuário correto.', async () => {
      await chai.request(server).post('/users')
      .send({
        email: 'test2@email.com',
        name: 'test2',
        password: USER_EXAMPLE.password,
      });
  
      const newLoginResponse = await chai.request(server)
      .post('/login').send({ email: 'test2@email.com', password: USER_EXAMPLE.password, });

      before(async () => {
        await editTasksRequest(
          { title: 'Fazer testes 2', description: undefined, status: 'pronto' },
          newLoginResponse.body.token
        );
      });

      it('Deve retornar o código de status 401', () => {
        expect(response).to.have.status(UNAUTHORIZED);
      });

      it('Deve retornar um objeto', () => {
        expect(response.body).to.be.a('object');
      });

      it('Deve possuir a propriedade "message"', () => {
        expect(response.body).to.have.property('message');
      });

      it('A propriedade "message" deve ser igual a "invalid token"', () => {
        expect(response.body.message).to.be.equal('invalid token');
      });
    });
  });

  describe('Testes de remoção de "tasks".', () => {
    let response;

    const deleteTaskRequest = async (token) => {
      response = await chai.request(server)
      .delete(`/tasks/${taskId}`)
      .set('authorization', token);
    };

    describe('Quando o "authorization" não for o do usuário correto.', async () => {  
      const newLoginResponse = await chai.request(server)
      .post('/login').send({ email: 'test2@email.com', password: USER_EXAMPLE.password, });

      before(async () => {
        await deleteTaskRequest(newLoginResponse.body.token);
      });

      it('Deve retornar o código de status 401', () => {
        expect(response).to.have.status(UNAUTHORIZED);
      });

      it('Deve retornar um objeto', () => {
        expect(response.body).to.be.a('object');
      });

      it('Deve possuir a propriedade "message"', () => {
        expect(response.body).to.have.property('message');
      });

      it('A propriedade "message" deve ser igual a "invalid token"', () => {
        expect(response.body.message).to.be.equal('invalid token');
      });
    });

    describe('Quando a "task" é deletada com sucesso.', () => {
      before(async () => {
        await deleteTaskRequest(loginResponse.body.token);
      });

      it('Deve retornar o código de status 204', () => {
        expect(response).to.have.status(NO_CONTENT);
      });
    });
  });
});
