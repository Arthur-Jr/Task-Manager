import React, { useState } from 'react';
import { useNavigate } from 'react-router';

import api from '../api/api';

function Login() {
  const navigate = useNavigate();

  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const login = async () => {
    try {
      const { data } = await api.post('/login', { email: emailValue, password: passwordValue });
      localStorage.setItem('task-manager-token', data.token);
      navigate('/tasks');
    } catch (error) {
      setErrorMessage(error.response.data.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    await login();
  };

  return (
    <main>
      <h3>Login</h3>
      <form onSubmit={ handleSubmit }>
        <label htmlFor="email">
          <input
            type="text"
            id='email'
            placeholder='email'
            value={ emailValue }
            onChange={ ({ target }) => setEmailValue(target.value) }
            name='email'
            required
          />
        </label>

        <label htmlFor="">
          <input
            type="password"
            maxLength={ 6 }
            minLength={ 6 }
            placeholder='password'
            value={ passwordValue }
            onChange={ ({ target }) => setPasswordValue(target.value) }
            name='password'
            required
          />
        </label>

        <button type='submit'>Entrar</button>
      </form>
      <span>{ errorMessage }</span>
    </main>
  );
}

export default Login;
