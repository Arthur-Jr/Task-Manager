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

describe('Testes do login.', () => {
  describe('Testando se os elementos estão presentes na tela no desktop.', () => {
    beforeEach(() => {
      renderWithRouter(<App />);
    });

    test('Deve conter dois títulos na tela "Login" e "Cadastro" ', () => {
      const titles = screen.getAllByRole('heading', { level: 3 });
      expect(titles[0]).toBe('Login');
      expect(titles[1]).toBe('Cadastro');
    });

    test('Deve conter cinco inputs na tela.', () => {
      const emails = screen.getByAllPlaceholderText(/email/i);
      const passwords = screen.getAllByPlaceholderText(/password/i);
      const name = screen.getByPlaceholderText(/nome/i);

      expect(emails).toHaveLength(2);
      expect(passwords).toHaveLength(2);
      expect(name).toBeInTheDocument();
    });

    test('Deve conter dois botões na tela', () => {
      const buttons = screen.getAllByRole('button');

      expect(buttons).toHaveLength(2);
      expect(buttons[0]).toBeInTheDocument();
      expect(buttons[0].innerText).toBe('Login');
      expect(buttons[1]).toBeInTheDocument();
      expect(buttons[1].innerText).toBe('Cadastrar');
    });
  });

  global.innerWidth = 650;
  describe('Testando se os elementos estão presentes na tela no mobile.', () => {
    beforeEach(() => {
      renderWithRouter(<App />);
    });

    test('Deve conter um título na tela escrito "Login" ', () => {
      const title = screen.getByRole('heading', { level: 3, name: /login/i });
      expect(title).toBeInTheDocument();
    });

    test('Deve conter dois inputs na tela um de email e outro de password.', () => {
      const email = screen.getByPlaceholderText(/email/i);
      const password = screen.getByPlaceholderText(/password/i);

      expect(email).toBeInTheDocument();
      expect(password).toBeInTheDocument();
    });

    test('Deve conter um botão na tela de entrar', () => {
      const button = screen.getByRole('button', { name: /entrar/i });
      expect(button).toBeInTheDocument();
    });

    test('Deve conter o botão para ir pra parte de cadastro', () => {
      const registerButton = screen.getByRole('button', { name: /cadastrar-se/i });
      expect(registerButton).toBeInTheDocument();
    });

    test('A parte de cadastro não deve estar presente na tela ao abrir a página.', () => {
      const title = screen.getByRole('heading', { level: 3, name: /cadastro/i });
      expect(title).not.toBeInTheDocument();
    });
  });

  describe('Testando o funcionamento dos inputs de login.', () => {
    let HISTORY;
    beforeEach(() => {
      const { history } = renderWithRouter(<App />);
      HISTORY = history;
    });

    test('Deve apresentar uma menssagem de erro ao colocar um email inválido.', () => {
      const email = screen.getByPlaceholderText(/email/i);
      const password = screen.getByPlaceholderText(/password/i);
      const button = screen.getByRole('button', { name: /entrar/i });

      userEvent.type(email, 'xabalu');
      userEvent.type(password, '123456');
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
      const button = screen.getByRole('button', { name: /entrar/i });

      userEvent.type(email, 'email@email.com');
      userEvent.type(password, '1');
      userEvent.click(button);

      const message = screen.getByTestId('error-message');
      expect(message).toBeInTheDocument();
      expect(message.innerText).toBe('Senha deve conter 6 digitos');

      setTimeout(() => {
        expect(message).not.toBeInTheDocument();
      }, 6000);
    });

    test('Deve apresentar uma menssagem de erro ao colocar dados incorreto."', () => {
      axiosPostMock({ data: { message: 'Incorrect username or password' } });
      const email = screen.getByPlaceholderText(/email/i);
      const password = screen.getByPlaceholderText(/password/i);
      const button = screen.getByRole('button', { name: /entrar/i });

      userEvent.type(email, 'email@email.com');
      userEvent.type(password, '123456');
      userEvent.click(button);

      const message = screen.getByTestId('error-message');
      expect(message).toBeInTheDocument();
      expect(message.innerText).toBe('Incorrect username or password');

      setTimeout(() => {
        expect(message).not.toBeInTheDocument();
      }, 6000);
    });

    test('Deve ir para a página de "tasks se os dados estiverem corretos."', () => {
      axiosPostMock({ data: { token: 'token' } });
      const email = screen.getByPlaceholderText(/email/i);
      const password = screen.getByPlaceholderText(/password/i);
      const button = screen.getByRole('button', { name: /entrar/i });

      userEvent.type(email, 'email@email.com');
      userEvent.type(password, '123456');
      userEvent.click(button);

      const storageToken = JSON.parse(localStorage.getItem('task-manager-token'));

      expect(storageToken).tobe('token');
      expect(HISTORY.location.pathname).toBe('/tasks');
    });
  });
});
