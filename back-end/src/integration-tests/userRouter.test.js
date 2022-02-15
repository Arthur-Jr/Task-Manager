const sinon = require('sinon');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { MongoClient } = require('mongodb');

const { getConnection } = require('./mongoMockConnection');
const server = require('../api/app');
const { CREATED, BAD_REQUEST, CONFLICT } = require('../utils/http-status-code');

const { expect } = chai;

chai.use(chaiHttp);

const DB_NAME = 'task-manager';
const DB_COLLECTION = 'users';

describe('Testes da rota "users"', () => {
  let connectionMock;
  const USER_EXAMPLE = { email: 'test@email.com', name: 'test', password: 'test123'};

  before(async () => {
    connectionMock = await getConnection();
    sinon.stub(MongoClient, 'connect').resolves(connectionMock);
  });

  after(async () => {
    await connectionMock.db(DB_NAME).collection(DB_COLLECTION).deleteMany({});
    await connectionMock.db(DB_NAME).collection(DB_COLLECTION).drop();
    MongoClient.connect.restore();
  });

  describe('Testes de cadastro de usuário', () => {
    let response;

    const registerUser = async (email, name, password) => {
      response = await chai.request(server)
      .post('/users')
      .send({ email, name, password, });
    }

    describe('Quando é cadatrado com sucesso.', () => {
      before(async () => {
        await registerUser(USER_EXAMPLE.email, USER_EXAMPLE.name, USER_EXAMPLE.password);
      });

      it('Deve retornar o código de status 201', () => {
        expect(response).to.have.status(CREATED);
      });

      it('Deve retornar um objeto', () => {
        expect(response.body).to.be.a('object');
      });

      it('Deve possuir a propriedade "user"', () => {
        expect(response.body).to.have.property('user');
      });

      it('Na propriedade "user" deve existir um "_id"', () => {
        expect(response.body.user).to.have.property('_id');
      });
    });

    describe('Quando o campo "email" não for valido.', () => {
      before(async () => {
        await registerUser('abc@', USER_EXAMPLE.name, USER_EXAMPLE.password);
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

    describe('Quando o campo "password" não for valido.', () => {
      before(async () => {
        await registerUser(USER_EXAMPLE.email, USER_EXAMPLE.name, '123');
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

    describe('Quando o "email" já está cadastrado', () => {
      before(async () => {
        await registerUser(USER_EXAMPLE.email, USER_EXAMPLE.name, USER_EXAMPLE.password);

        it('Deve retornar o código de status 400', () => {
          expect(response).to.have.status(CONFLICT);
        });
  
        it('Deve retornar um objeto', () => {
          expect(response.body).to.be.a('object');
        });
  
        it('Deve possuir a propriedade "message"', () => {
          expect(response.body).to.have.property('message');
        });
  
        it('A propriedade "message" deve ser igual a ""Email" already registered"', () => {
          expect(response.body.message).to.be.equal('"Email" already registered');
        });
      });
    });
  });
});
