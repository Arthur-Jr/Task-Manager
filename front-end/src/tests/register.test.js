import React from 'react';
import axios from 'axios';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import renderWithRouter from './testConfig';
import App from '../App';

jest.mock('axios');

const axiosPostMock = (returnValue) => {
  axios.post.mockResolvedValue(returnValue);
};

afterAll(() => {
  axios.mockRestore();
});

describe('Testes do cadastro.', () => {
  global.innerWidth = 650;
  let HISTORY;

  beforeEach(() => {
    const { history } = renderWithRouter(<App />);
    HISTORY = history;

    const registerButton = screen.getByRole('button', { name: /cadastrar-se/i });
    userEvent.click(registerButton);
  });

  describe('Testando se os elementos estão presentes na tela.', () => {
    test('Deve conter um título na tela escrito "Cadastro" ', () => {
      const title = screen.getByRole('heading', { level: 3, name: /cadastro/i });
      expect(title).toBeInTheDocument();
    });

    test('Deve conter três inputs na tela email, password e nome.', () => {
      const email = screen.getByPlaceholderText(/email/i);
      const password = screen.getByPlaceholderText(/password/i);
      const name = screen.getByPlaceholderText(/nome/i);

      expect(email).toBeInTheDocument();
      expect(password).toBeInTheDocument();
      expect(name).toBeInTheDocument();
    });

    test('Deve conter um botão na tela de cadastro', () => {
      const button = screen.getByRole('button', { name: /cadastrar/i });
      expect(button).toBeInTheDocument();
    });

    test('A parte de login não deve estar presente na tela.', () => {
      const title = screen.getByRole('heading', { level: 3, name: /login/i });
      expect(title).not.toBeInTheDocument();
    });
  });

  describe('Testando o funcionamento dos inputs de cadastro.', () => {
    test('Deve apresentar uma menssagem de erro ao colocar um email inválido.', () => {
      const email = screen.getByPlaceholderText(/email/i);
      const password = screen.getByPlaceholderText(/password/i);
      const name = screen.getByPlaceholderText(/nome/i);
      const button = screen.getByRole('button', { name: /cadastrar/i });

      userEvent.type(email, 'test');
      userEvent.type(password, '123456');
      userEvent.type(name, 'test');
      userEvent.click(button);

      const message = screen.getByTestId('error-message');
      expect(message).toBeInTheDocument();
      expect(message.innerText).toBe('Email inválido');

      setTimeout(() => {
        expect(message).not.toBeInTheDocument();
      }, 6000);
    });

    test('Deve apresentar uma menssagem de erro ao colocar uma senha inválida.', () => {
      const email = screen.getByPlaceholderText(/email/i);
      const password = screen.getByPlaceholderText(/password/i);
      const name = screen.getByPlaceholderText(/nome/i);
      const button = screen.getByRole('button', { name: /cadastrar/i });

      userEvent.type(email, 'email@email.com');
      userEvent.type(password, '1');
      userEvent.type(name, 'test');
      userEvent.click(button);

      const message = screen.getByTestId('error-message');
      expect(message).toBeInTheDocument();
      expect(message.innerText).toBe('Senha deve conter 6 digitos');

      setTimeout(() => {
        expect(message).not.toBeInTheDocument();
      }, 6000);
    });

    test('Deve apresentar uma menssagem de erro ao tentar cadastrar ume email já cadastrado."', () => {
      axiosPostMock({ data: { message: 'Email already registered' } });
      const email = screen.getByPlaceholderText(/email/i);
      const password = screen.getByPlaceholderText(/password/i);
      const name = screen.getByPlaceholderText(/nome/i);
      const button = screen.getByRole('button', { name: /cadastrar/i });

      userEvent.type(email, 'email@email.com');
      userEvent.type(password, '123456');
      userEvent.type(name, 'test');
      userEvent.click(button);

      const message = screen.getByTestId('error-message');
      expect(message).toBeInTheDocument();
      expect(message.innerText).toBe('Email already registered');

      setTimeout(() => {
        expect(message).not.toBeInTheDocument();
      }, 6000);
    });

    test('Deve ir para a página de "tasks se os dados estiverem corretos."', () => {
      axiosPostMock({ data: { token: 'token' } });
      const email = screen.getByPlaceholderText(/email/i);
      const password = screen.getByPlaceholderText(/password/i);
      const name = screen.getByPlaceholderText(/nome/i);
      const button = screen.getByRole('button', { name: /cadastrar/i });

      userEvent.type(email, 'email@email.com');
      userEvent.type(password, '123456');
      userEvent.type(name, 'test');
      userEvent.click(button);

      const storageToken = JSON.parse(localStorage.getItem('task-manager-token'));

      expect(storageToken).tobe('token');
      expect(HISTORY.location.pathname).toBe('/tasks');
    });
  });
});
