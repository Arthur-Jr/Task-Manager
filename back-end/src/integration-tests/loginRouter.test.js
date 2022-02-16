const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { MongoClient } = require('mongodb');

const { getConnection } = require('./mongoMockConnection');
const server = require('../api/app');
const { BAD_REQUEST, HTTP_OK_STATUS, UNAUTHORIZED } = require('../utils/http-status-code');

const { expect } = chai;

chai.use(chaiHttp);

const DB_NAME = 'task-manager';
const DB_COLLECTION = 'users';

describe('Testes da rota "login"', () => {
  let connectionMock;
  const USER_EXAMPLE = { email: 'test@email.com', name: 'test', password: '123456'};

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
  });

  after(async () => {
    await connectionMock.db(DB_NAME).collection(DB_COLLECTION).deleteMany({});
    await connectionMock.db(DB_NAME).collection(DB_COLLECTION).drop();
    MongoClient.connect.restore();
    console.log.restore();
  });

  describe('Testes do login', () => {
    let response;

    const loginRequest = async (email, password) => {
      response = await chai.request(server)
      .post('/login').send({ email, password, });
    }

    describe('Quando o login é feito com sucesso.', () => {
      before(async () => {
        await loginRequest(USER_EXAMPLE.email, USER_EXAMPLE.password);
      });

      it('Deve retornar o código de status 200', () => {
        expect(response).to.have.status(HTTP_OK_STATUS);
      });

      it('Deve retornar um objeto', () => {
        expect(response.body).to.be.a('object');
      });

      it('Deve possuir a propriedade "token"', () => {
        expect(response.body).to.have.property('token');
      });

      it('A propriedade "token" deve ser uma string', () => {
        expect(response.body.token).to.be.a('string');
      });
    });

    describe('Quando o campo "email" não for valido.', () => {
      before(async () => {
        await loginRequest('abc@', USER_EXAMPLE.password);
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

      it('A propriedade "message" deve ser igual a ""email" must be a valid email"', () => {
        expect(response.body.message).to.be.equal('"email" must be a valid email');
      });
    });

    describe('Quando o campo "email" está incorreto.', () => {
      before(async () => {
        await loginRequest('test1@email.com', USER_EXAMPLE.password);
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

      it('A propriedade "message" deve ser igual a "Incorrect username or password"', () => {
        expect(response.body.message).to.be.equal('Incorrect username or password');
      });
    });

    describe('Quando o campo "password" não for valido.', () => {
      before(async () => {
        await loginRequest(USER_EXAMPLE.email, '123');
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

      it('A propriedade "message" deve ser igual a ""email" must be a valid email"', () => {
        expect(response.body.message).to.be.equal('"password" length must be 6 characters long');
      });
    });

    describe('Quando o campo "password" está incorreto.', () => {
      before(async () => {
        await loginRequest(USER_EXAMPLE.email, 'abcdef');
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

      it('A propriedade "message" deve ser igual a "Incorrect username or password"', () => {
        expect(response.body.message).to.be.equal('Incorrect username or password');
      });
    });
  });
});
