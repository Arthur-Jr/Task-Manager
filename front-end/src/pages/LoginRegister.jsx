import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';

import Login from '../components/Login.jsx';
import Register from '../components/Register.jsx';
import api from '../api/api';

function LoginRegister() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('task-manager-token');
    const getTasks = async () => {
      try {
        const response = await api.get('/tasks', { headers: { authorization: token } });
        if (response.status === 200) navigate('/tasks');
      } catch (error) {
        console.log(error);
      }
    };

    if (token) {
      getTasks();
    }
  }, [navigate]);

  return (
    <main>
      <Login/>
      <br />
      <br />
      <br />
      <Register />
    </main>
  );
}

export default LoginRegister;
