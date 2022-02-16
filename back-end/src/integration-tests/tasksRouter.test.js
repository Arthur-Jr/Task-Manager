const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { MongoClient } = require('mongodb');

const { getConnection } = require('./mongoMockConnection');
const server = require('../api/app');
const { CREATED, BAD_REQUEST, CONFLICT, UNAUTHORIZED } = require('../utils/http-status-code');

const { expect } = chai;

chai.use(chaiHttp);

const DB_NAME = 'task-manager';
const DB_COLLECTION = 'tasks';
const USER_EXAMPLE = { email: 'test@email.com', name: 'test', password: '123456'};
const TASK_EXAMPLE = { title: 'test task', description: 'testing', status: 'pendente' };

describe('Testes da rota "tasks".', () => {
  let connectionMock;
  let loginResponse;

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
    sinon.stub(console, 'log');

    await chai.request(server).post('/users')
    .send({
      email: USER_EXAMPLE.email,
      name: USER_EXAMPLE.name,
      password: USER_EXAMPLE.password,
    });

    loginResponse = await chai.request(server)
    .post('/login').send({ email, password, }).body.token;
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
      .set('Authorization', token)
      .send({ description, title, status });
    };

    describe('Quando a "task" é registrada com sucesso.', () => {
      before(async () => {
        await registerTask(TASK_EXAMPLE.description, TASK_EXAMPLE.title, TASK_EXAMPLE.status, loginResponse);
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
        expect(response.body).to.have.property('useId');
      });
    });

    describe('Quando o campo "title" não for valido.', () => {
      before(async () => {
        await loginRequest(TASK_EXAMPLE.description, undefined, TASK_EXAMPLE.status, loginResponse);
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
        await loginRequest(TASK_EXAMPLE.description, TASK_EXAMPLE.title, undefined, loginResponse);
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

    describe('Quando o "Authorization" for vazio.', () => {
      before(async () => {
        await loginRequest(TASK_EXAMPLE.description, TASK_EXAMPLE.title, TASK_EXAMPLE.status, undefined);
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

      it('A propriedade "message" deve ser igual a ""status" is required"', () => {
        expect(response.body.message).to.be.equal('Token not found');
      });
    });

    describe('Quando o "Authorization" for inválido.', () => {
      before(async () => {
        await loginRequest(TASK_EXAMPLE.description, TASK_EXAMPLE.title, TASK_EXAMPLE.status, '999');
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

      it('A propriedade "message" deve ser igual a ""status" is required"', () => {
        expect(response.body.message).to.be.equal('Expired or invalid token');
      });
    });
  });
});
