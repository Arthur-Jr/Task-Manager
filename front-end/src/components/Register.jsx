import React, { useState } from 'react';
import api from '../api/api';

function Register() {
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [nameValue, setNameValue] = useState('');
  const [popUpMessage, setPopUpMessage] = useState('');

  const registerNewUser = async () => {
    try {
      await api.post('/users', {
        email: emailValue, password: passwordValue, name: nameValue,
      });
      setPopUpMessage('Cadastro feito com sucesso');
    } catch (error) {
      setPopUpMessage(error.response.data.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPopUpMessage('');
    await registerNewUser();
  };

  return (
    <main>
      <h3>Cadastro</h3>
      <form onSubmit={ handleSubmit }>
        <label htmlFor="email">
          <input
            type="text"
            id='email'
            placeholder='Email'
            value={ emailValue }
            onChange={ ({ target }) => setEmailValue(target.value) }
            required
            name='email'
          />
        </label>

        <label htmlFor="name">
          <input
            type="text"
            id='name'
            value={ nameValue }
            minLength={ 3 }
            onChange={ ({ target }) => setNameValue(target.value) }
            placeholder="Nome"
            required
            name='name'
          />
        </label>

        <label htmlFor="">
          <input
            type="password"
            maxLength={ 6 }
            minLength={ 6 }
            placeholder='Password'
            value={ passwordValue }
            onChange={ ({ target }) => setPasswordValue(target.value) }
            required
            name='password'
          />
        </label>

        <button type='submit'>Cadastrar</button>
      </form>
      <span>{ popUpMessage }</span>
    </main>
  );
}

export default Register;
